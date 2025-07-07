-- Create promo_code table
CREATE TABLE IF NOT EXISTS promo_code (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL UNIQUE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('PERCENTAGE', 'FIXED', 'FREE')),
    value DECIMAL(21,2) NOT NULL,
    max_uses INTEGER NOT NULL,
    used_count INTEGER DEFAULT 0,
    expires_at TIMESTAMP WITH TIME ZONE,
    person_profile_id BIGINT,
    event_id BIGINT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_promo_code_person_profile FOREIGN KEY (person_profile_id) REFERENCES person_profile(id),
    CONSTRAINT fk_promo_code_event FOREIGN KEY (event_id) REFERENCES event(id)
);

-- Alternative: If gen_random_uuid() is not available, use this approach:
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- Then use: uuid_generate_v4() instead of gen_random_uuid()

-- Insert a FREE promo code
INSERT INTO promo_code (id, code, type, value, max_uses, used_count, expires_at, is_active) 
VALUES (
    gen_random_uuid(),   -- id (explicitly generate UUID)
    'FREE100',           -- code
    'FREE',              -- type
    0.00,                -- value (0 for free)
    100,                 -- max_uses
    0,                   -- used_count (starts at 0)
    '2025-12-31 23:59:59+00', -- expires_at (end of 2025)
    true                 -- is_active
);

-- Insert a PERCENTAGE promo code (50% off)
INSERT INTO promo_code (id, code, type, value, max_uses, used_count, expires_at, is_active) 
VALUES (
    gen_random_uuid(),   -- id
    'HALF50',            -- code
    'PERCENTAGE',        -- type
    50.00,               -- value (50% discount)
    50,                  -- max_uses
    0,                   -- used_count
    '2025-12-31 23:59:59+00', -- expires_at
    true                 -- is_active
);

-- Insert a FIXED promo code (€10 off)
INSERT INTO promo_code (id, code, type, value, max_uses, used_count, expires_at, is_active) 
VALUES (
    gen_random_uuid(),   -- id
    'SAVE10',            -- code
    'FIXED',             -- type
    10.00,               -- value (€10 discount)
    25,                  -- max_uses
    0,                   -- used_count
    '2025-12-31 23:59:59+00', -- expires_at
    true                 -- is_active
);

-- Insert an event-specific FREE promo code
INSERT INTO promo_code (id, code, type, value, max_uses, used_count, expires_at, event_id, is_active) 
VALUES (
    gen_random_uuid(),   -- id
    'EVENTFREE',         -- code
    'FREE',              -- type
    0.00,                -- value
    10,                  -- max_uses
    0,                   -- used_count
    '2025-12-31 23:59:59+00', -- expires_at
    1,                   -- event_id (replace with actual event ID)
    true                 -- is_active
); 