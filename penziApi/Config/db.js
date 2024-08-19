import dotenv from 'dotenv';
import assert from 'assert';

dotenv.config();

const { PORT, HOST_URL, SQL_USER, SQL_PWD, SQL_DB, SQL_SERVER } = process.env;

const sqlEncrypt = process.env.SQL_ENCRYPT === "true";

assert(PORT, 'PORT is required');
assert(SQL_SERVER, 'SQL_SERVER is required'); // Ensure SQL_SERVER is defined
assert(SQL_DB, 'SQL_DB is required'); // Ensure SQL_DB is defined

const config = {
    server: SQL_SERVER, // Correct property name for mssql
    database: SQL_DB,
    user: SQL_USER,
    password: SQL_PWD,
    options: {
        encrypt: sqlEncrypt,
        enableArithAbort: true
    }
};





export default config;
