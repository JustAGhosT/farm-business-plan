#!/usr/bin/env node

/**
 * Database Connection Test Script
 *
 * This script tests the database connection and verifies that required tables exist.
 * Run with: node scripts/test-db-connection.js
 */

const { Pool } = require('pg')
require('dotenv').config({ path: '.env.local' })

async function testConnection() {
  console.log('🔍 Testing database connection...\n')

  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL

  if (!connectionString) {
    console.error('❌ ERROR: DATABASE_URL or POSTGRES_URL environment variable not set')
    console.log('\nPlease set DATABASE_URL in .env.local:')
    console.log('DATABASE_URL="postgresql://username:password@localhost:5432/farm_business_plan"\n')
    process.exit(1)
  }

  const pool = new Pool({
    connectionString,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  })

  try {
    // Test basic connection
    console.log('Testing connection to:', connectionString.replace(/:[^:@]+@/, ':****@'))
    const versionResult = await pool.query('SELECT version()')
    console.log('✅ Database connected successfully!')
    console.log(
      '📊 PostgreSQL version:',
      versionResult.rows[0].version.split(' ')[0],
      versionResult.rows[0].version.split(' ')[1]
    )
    console.log()

    // Check for required tables
    console.log('Checking required tables...')
    const requiredTables = ['users', 'farm_plans', 'crop_plans', 'tasks', 'climate_data']

    for (const tableName of requiredTables) {
      const result = await pool.query(
        `SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = $1
        )`,
        [tableName]
      )

      if (result.rows[0].exists) {
        console.log(`  ✅ ${tableName}`)
      } else {
        console.log(`  ❌ ${tableName} - MISSING`)
      }
    }

    console.log()

    // Check users table specifically (for authentication)
    const usersCheck = await pool.query(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      )`
    )

    if (!usersCheck.rows[0].exists) {
      console.log('⚠️  WARNING: Users table not found!')
      console.log('   Registration will fail until you run the authentication migration.')
      console.log('   Run: psql $DATABASE_URL -f db/migrations/002_add_authentication.sql\n')
    } else {
      // Count users
      const userCount = await pool.query('SELECT COUNT(*) FROM users')
      console.log(`👥 Users table exists with ${userCount.rows[0].count} user(s)`)
      console.log()
    }

    console.log('✅ Database setup looks good!')
    console.log()
  } catch (error) {
    console.error('❌ Database connection failed!')
    console.error('Error:', error.message)
    console.log()
    console.log('Troubleshooting:')
    console.log('1. Make sure PostgreSQL is running')
    console.log('2. Verify DATABASE_URL is correct in .env.local')
    console.log('3. Run: psql $DATABASE_URL -c "SELECT version();" to test connection')
    console.log('4. See SETUP_DATABASE.md for detailed setup instructions')
    console.log()
    process.exit(1)
  } finally {
    await pool.end()
  }
}

testConnection()
