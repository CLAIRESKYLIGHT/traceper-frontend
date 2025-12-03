-- ============================================
-- TRACEPER Database Triggers Viewer
-- ============================================
-- Run these queries to view all triggers in your database
-- Replace 'your_database_name' with your actual database name

-- ============================================
-- METHOD 1: Simple View (Recommended for Presentation)
-- ============================================
-- Shows all triggers in a simple, readable format
SHOW TRIGGERS;

-- ============================================
-- METHOD 2: Detailed View with Information Schema
-- ============================================
-- Get comprehensive information about all triggers
SELECT 
    TRIGGER_NAME AS 'Trigger Name',
    EVENT_MANIPULATION AS 'Event',  -- INSERT, UPDATE, DELETE
    EVENT_OBJECT_TABLE AS 'Table',
    ACTION_TIMING AS 'Timing',  -- BEFORE, AFTER
    ACTION_STATEMENT AS 'Action',
    CREATED AS 'Created Date'
FROM 
    INFORMATION_SCHEMA.TRIGGERS
WHERE 
    TRIGGER_SCHEMA = DATABASE()  -- Uses current database
ORDER BY 
    EVENT_OBJECT_TABLE, TRIGGER_NAME;

-- ============================================
-- METHOD 3: View Triggers for Specific Table
-- ============================================
-- View all triggers attached to 'transactions' table
SHOW TRIGGERS WHERE `Table` = 'transactions';

-- View all triggers attached to 'financial_records' table
SHOW TRIGGERS WHERE `Table` = 'financial_records';

-- View all triggers attached to 'projects' table
SHOW TRIGGERS WHERE `Table` = 'projects';

-- ============================================
-- METHOD 4: View Full Trigger Definition
-- ============================================
-- Replace 'trigger_name' with actual trigger name
-- Example: update_project_amount_spent_on_insert
SHOW CREATE TRIGGER trigger_name;

-- ============================================
-- METHOD 5: Count Triggers by Table
-- ============================================
-- See how many triggers each table has
SELECT 
    EVENT_OBJECT_TABLE AS 'Table',
    COUNT(*) AS 'Number of Triggers'
FROM 
    INFORMATION_SCHEMA.TRIGGERS
WHERE 
    TRIGGER_SCHEMA = DATABASE()
GROUP BY 
    EVENT_OBJECT_TABLE
ORDER BY 
    COUNT(*) DESC;

-- ============================================
-- METHOD 6: View Trigger Events Summary
-- ============================================
-- See what events trigger what actions
SELECT 
    EVENT_OBJECT_TABLE AS 'Table',
    EVENT_MANIPULATION AS 'Event',
    ACTION_TIMING AS 'Timing',
    COUNT(*) AS 'Count'
FROM 
    INFORMATION_SCHEMA.TRIGGERS
WHERE 
    TRIGGER_SCHEMA = DATABASE()
GROUP BY 
    EVENT_OBJECT_TABLE, 
    EVENT_MANIPULATION, 
    ACTION_TIMING
ORDER BY 
    EVENT_OBJECT_TABLE, 
    EVENT_MANIPULATION;

-- ============================================
-- NOTES FOR PRESENTATION:
-- ============================================
-- 1. Run "SHOW TRIGGERS;" first - it's the simplest
-- 2. Use METHOD 2 for detailed information
-- 3. Use METHOD 4 to show trigger code/logic
-- 4. Use METHOD 5 to show trigger distribution
-- ============================================

