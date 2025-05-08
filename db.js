const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.POSTGRESQL_EXTERNAL_URL,
    ssl: { rejectUnauthorized: false }, // para Render
});

module.exports = pool;
