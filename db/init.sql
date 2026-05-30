CREATE TABLE IF NOT EXISTS "Station" (
    "id" VARCHAR(36) PRIMARY KEY,
    "name" VARCHAR(100) NOT NULL,
    "code" VARCHAR(50) UNIQUE NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Reading" (
    "id" VARCHAR(36) PRIMARY KEY,
    "stationId" VARCHAR(36) NOT NULL REFERENCES "Station"("id") ON DELETE CASCADE,
    "pm25" DOUBLE PRECISION NOT NULL,
    "pm10" DOUBLE PRECISION NOT NULL,
    "tsp" DOUBLE PRECISION NOT NULL,
    "windSpeed"     DOUBLE PRECISION NOT NULL DEFAULT 0,
    "windDirection" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "temperature"   DOUBLE PRECISION NOT NULL DEFAULT 30,
    "timestamp" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Seed initial stations if they do not exist
INSERT INTO "Station" ("id", "name", "code", "latitude", "longitude", "createdAt", "updatedAt")
VALUES
    ('st-01', 'Bangkok Central Station', 'BKK-01', 13.7563, 100.5018, NOW(), NOW()),
    ('st-02', 'Lumpini Park Station', 'BKK-02', 13.7314, 100.5414, NOW(), NOW()),
    ('st-03', 'Chatuchak Station', 'BKK-03', 13.8034, 100.5539, NOW(), NOW()),
    ('st-04', 'Thonburi Station', 'BKK-04', 13.7506, 100.4789, NOW(), NOW()),
    ('st-05', 'Suvarnabhumi Station', 'BKK-05', 13.6896, 100.7501, NOW(), NOW())
ON CONFLICT ("code") DO NOTHING;
