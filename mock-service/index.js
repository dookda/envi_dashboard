const { Client } = require('pg');
const crypto = require('crypto');

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@db:5432/envi_db';

async function connectWithRetry(maxRetries = 10, delayMs = 3000) {
  let client;
  for (let i = 0; i < maxRetries; i++) {
    try {
      console.log(`Connecting to database (attempt ${i + 1}/${maxRetries})...`);
      client = new Client({ connectionString });
      await client.connect();
      console.log('Connected to database successfully!');
      return client;
    } catch (err) {
      console.error(`Database connection failed: ${err.message}`);
      if (client) {
        try { await client.end(); } catch (e) {}
      }
      if (i < maxRetries - 1) {
        console.log(`Waiting ${delayMs / 1000}s before retrying...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
  }
  throw new Error('Could not connect to database after maximum retries');
}

// Generate realistic mock data using random walk
const stationBaselines = {
  'st-01': { pm25: 25, pm10: 55, tsp: 85 },
  'st-02': { pm25: 18, pm10: 40, tsp: 65 },
  'st-03': { pm25: 35, pm10: 75, tsp: 110 },
  'st-04': { pm25: 22, pm10: 48, tsp: 75 },
  'st-05': { pm25: 30, pm10: 65, tsp: 95 }
};

function generateValue(baseline, min, max, variance) {
  const change = (Math.random() - 0.5) * variance;
  let val = baseline + change;
  if (val < min) val = min;
  if (val > max) val = val - Math.random() * variance;
  return Math.round(val * 10) / 10;
}

async function run() {
  let client;
  try {
    client = await connectWithRetry();

    // Fetch stations to ensure we have them
    console.log('Fetching stations...');
    const res = await client.query('SELECT id, name, code FROM "Station"');
    const stations = res.rows;
    console.log(`Found ${stations.length} stations:`, stations.map(s => s.name).join(', '));

    if (stations.length === 0) {
      console.error('No stations found in database. Exiting.');
      process.exit(1);
    }

    // Main ingestion loop
    console.log('Starting ingestion loop...');
    while (true) {
      const timestamp = new Date();
      console.log(`--- Ingesting readings at ${timestamp.toISOString()} ---`);

      for (const station of stations) {
        const baseline = stationBaselines[station.id] || { pm25: 25, pm10: 55, tsp: 85 };
        
        // Generate current values
        const pm25 = generateValue(baseline.pm25, 5, 150, 8);
        const pm10 = generateValue(baseline.pm10, 10, 250, 15);
        const tsp = generateValue(baseline.tsp, 15, 350, 20);

        // Update baselines slightly so data drifts smoothly over time (random walk)
        baseline.pm25 = pm25;
        baseline.pm10 = pm10;
        baseline.tsp = tsp;
        stationBaselines[station.id] = baseline;

        const id = crypto.randomUUID();

        await client.query(
          `INSERT INTO "Reading" ("id", "stationId", "pm25", "pm10", "tsp", "timestamp", "createdAt") 
           VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
          [id, station.id, pm25, pm10, tsp, timestamp]
        );

        console.log(`Inserted reading for ${station.name} (${station.code}): PM2.5=${pm25}, PM10=${pm10}, TSP=${tsp}`);
      }

      // Wait 10 seconds before next ingestion
      await new Promise(resolve => setTimeout(resolve, 10000));
    }
  } catch (err) {
    console.error('Fatal error in mock service:', err);
    if (client) {
      try { await client.end(); } catch (e) {}
    }
    process.exit(1);
  }
}

run();
