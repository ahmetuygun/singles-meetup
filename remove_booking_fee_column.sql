-- Remove booking_fee column from ticket table
-- Run this SQL script manually in your database

ALTER TABLE ticket DROP COLUMN IF EXISTS booking_fee;

-- Verify the column was removed
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'ticket' 
ORDER BY ordinal_position; 