-- Create ticket table
CREATE TABLE ticket (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(255),
    price DECIMAL(21,2) NOT NULL,
    quantity_available INTEGER,
    quantity_sold INTEGER DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    gender_restriction VARCHAR(255),
    early_bird BOOLEAN DEFAULT false,
    event_id BIGINT,
    CONSTRAINT fk_ticket_event_id FOREIGN KEY (event_id) REFERENCES event(id)
);

-- Create user_ticket table
CREATE TABLE user_ticket (
    id BIGSERIAL PRIMARY KEY,
    quantity INTEGER NOT NULL,
    total_price DECIMAL(21,2) NOT NULL,
    booking_fee DECIMAL(21,2),
    payment_status VARCHAR(255) NOT NULL,
    payment_method VARCHAR(255),
    purchase_date TIMESTAMP WITH TIME ZONE,
    ticket_code VARCHAR(255),
    used BOOLEAN DEFAULT false,
    person_profile_id BIGINT,
    ticket_id BIGINT,
    CONSTRAINT fk_user_ticket_person_profile_id FOREIGN KEY (person_profile_id) REFERENCES person_profile(id),
    CONSTRAINT fk_user_ticket_ticket_id FOREIGN KEY (ticket_id) REFERENCES ticket(id)
);

-- Insert sample ticket data for existing events (only if tickets don't exist)
INSERT INTO ticket (name, description, price, quantity_available, quantity_sold, is_active, gender_restriction, early_bird, event_id)
SELECT 
    'Male Early Bird Ticket',
    'Early bird pricing for male participants',
    12.00,
    50,
    0,
    true,
    'MALE',
    true,
    e.id
FROM event e
WHERE NOT EXISTS (
    SELECT 1 FROM ticket t 
    WHERE t.event_id = e.id AND t.name = 'Male Early Bird Ticket'
);

INSERT INTO ticket (name, description, price, quantity_available, quantity_sold, is_active, gender_restriction, early_bird, event_id)
SELECT 
    'Female Early Bird Ticket',
    'Early bird pricing for female participants',
    12.00,
    50,
    0,
    true,
    'FEMALE',
    true,
    e.id
FROM event e
WHERE NOT EXISTS (
    SELECT 1 FROM ticket t 
    WHERE t.event_id = e.id AND t.name = 'Female Early Bird Ticket'
);

INSERT INTO ticket (name, description, price, quantity_available, quantity_sold, is_active, gender_restriction, early_bird, event_id)
SELECT 
    'Male General Admission',
    'General admission for male participants',
    15.00,
    100,
    0,
    true,
    'MALE',
    false,
    e.id
FROM event e
WHERE NOT EXISTS (
    SELECT 1 FROM ticket t 
    WHERE t.event_id = e.id AND t.name = 'Male General Admission'
);

INSERT INTO ticket (name, description, price, quantity_available, quantity_sold, is_active, gender_restriction, early_bird, event_id)
SELECT 
    'Female General Admission',
    'General admission for female participants',
    15.00,
    100,
    0,
    true,
    'FEMALE',
    false,
    e.id
FROM event e
WHERE NOT EXISTS (
    SELECT 1 FROM ticket t 
    WHERE t.event_id = e.id AND t.name = 'Female General Admission'
); 