CREATE TABLE IF NOT EXISTS "Station" (
    "id"        VARCHAR(36)       PRIMARY KEY,
    "name"      VARCHAR(100)      NOT NULL DEFAULT '',
    "code"      VARCHAR(50)       UNIQUE NOT NULL,
    "iotCard"   VARCHAR(50)       NOT NULL DEFAULT '',
    "latitude"  DOUBLE PRECISION  NOT NULL DEFAULT 0,
    "longitude" DOUBLE PRECISION  NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ       NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ       NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "Reading" (
    "id"            VARCHAR(36)       PRIMARY KEY,
    "stationId"     VARCHAR(36)       NOT NULL REFERENCES "Station"("id") ON DELETE CASCADE,
    "pm25"          DOUBLE PRECISION  NOT NULL,
    "pm10"          DOUBLE PRECISION  NOT NULL,
    "tsp"           DOUBLE PRECISION  NOT NULL,
    "windSpeed"     DOUBLE PRECISION  NOT NULL DEFAULT 0,
    "windDirection" DOUBLE PRECISION  NOT NULL DEFAULT 0,
    "temperature"   DOUBLE PRECISION  NOT NULL DEFAULT 30,
    "timestamp"     TIMESTAMPTZ       NOT NULL DEFAULT NOW(),
    "createdAt"     TIMESTAMPTZ       NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "Reading_timestamp_idx" ON "Reading"("timestamp");

CREATE TABLE IF NOT EXISTS "User" (
    "id"        VARCHAR(36)   PRIMARY KEY DEFAULT gen_random_uuid()::VARCHAR,
    "email"     VARCHAR(255)  UNIQUE NOT NULL,
    "name"      VARCHAR(100)  NOT NULL,
    "password"  TEXT          NOT NULL,
    "role"      VARCHAR(20)   NOT NULL DEFAULT 'operator',
    "createdAt" TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "Subscriber" (
    "id"          VARCHAR(36)  PRIMARY KEY,
    "lineUserId"  VARCHAR(64)  UNIQUE NOT NULL,
    "displayName" VARCHAR(255),
    "pictureUrl"  TEXT,
    "createdAt"   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "Config" (
    "key"       VARCHAR(64)  PRIMARY KEY,
    "value"     TEXT         NOT NULL,
    "updatedAt" TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Seed stations with real serial numbers and IoT card numbers
INSERT INTO "Station" ("id", "name", "code", "iotCard", "latitude", "longitude", "createdAt", "updatedAt")
VALUES
    ('st-01', '', '00402425072500067267', '8966032540696312462F', 0, 0, NOW(), NOW()),
    ('st-02', '', '00402425091300069457', '8966032540696312371F', 0, 0, NOW(), NOW()),
    ('st-03', '', '00402425091300119215', '8966032540696312421F', 0, 0, NOW(), NOW()),
    ('st-04', '', '00402425091300296510', '8966032540696312363F', 0, 0, NOW(), NOW()),
    ('st-05', '', '00402425091300199547', '8966032540696312405F', 0, 0, NOW(), NOW()),
    ('st-06', '', '00402425091300027158', '8966032540696312389F', 0, 0, NOW(), NOW())
ON CONFLICT ("id") DO NOTHING;

-- Seed default alert config
INSERT INTO "Config" ("key", "value", "updatedAt")
VALUES
    ('alert.enabled',  'true',  NOW()),
    ('alert.pm25',     '37.4',  NOW()),
    ('alert.pm10',     '99',    NOW()),
    ('alert.tsp',      '199',   NOW()),
    ('alert.cooldown', '30',    NOW())
ON CONFLICT ("key") DO NOTHING;
