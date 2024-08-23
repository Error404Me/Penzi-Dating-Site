import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'penzi',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export async function initializeDatabase() {
  let connection;
  try {
    // Get a connection from the pool
    connection = await pool.getConnection();
    
    // Create the database if it doesn't exist
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\``);
    console.log(`Database '${process.env.DB_NAME}' created or already exists.`);
    
    // Use the database
    await connection.query(`USE \`${process.env.DB_NAME}\``);

    // Define the table creation queries with unique foreign key names
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        phone VARCHAR(15) NOT NULL PRIMARY KEY,
        name VARCHAR(100),
        age INT,
        gender ENUM('Male', 'Female'),
        county VARCHAR(100),
        town VARCHAR(100),
        level_of_education VARCHAR(100),
        profession VARCHAR(100),
        marital_status ENUM('single', 'married', 'divorced', 'widowed'),
        religion VARCHAR(100),
        ethnicity VARCHAR(100),
        description TEXT
      );
    `;
    
    const createMatchingRequestsTable = `
      CREATE TABLE IF NOT EXISTS matching_requests (
        id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        requester_phone VARCHAR(15) NOT NULL,
        age_range VARCHAR(50),
        town VARCHAR(100),
        FOREIGN KEY (requester_phone) REFERENCES users(phone)
      );
    `;
    
    const createMatchesTable = `
      CREATE TABLE IF NOT EXISTS matches (
        id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        user_phone VARCHAR(15) NOT NULL,
        matched_user_phone VARCHAR(15) NOT NULL,
        CONSTRAINT fk_user_phone_matches FOREIGN KEY (user_phone) REFERENCES users(phone),
        FOREIGN KEY (matched_user_phone) REFERENCES users(phone)
      );
    `;
    
    const createUserRequestsTable = `
      CREATE TABLE IF NOT EXISTS user_requests (
        id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        user_phone VARCHAR(15) NOT NULL,
        request_type ENUM('details', 'self_description', 'match', 'next', 'confirm') NOT NULL,
        request_body TEXT,
        FOREIGN KEY (user_phone) REFERENCES users(phone)
      );
    `;
    
    const createUserResponsesTable = `
      CREATE TABLE IF NOT EXISTS user_responses (
        id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        request_id INT NOT NULL,
        response_body TEXT,
         FOREIGN KEY (request_id) REFERENCES user_requests(id)
      );
    `;
    
    // Execute table creation queries
    await connection.query(createUsersTable);
    await connection.query(createMatchingRequestsTable);
    await connection.query(createMatchesTable);
    await connection.query(createUserRequestsTable);
    await connection.query(createUserResponsesTable);

    console.log("Database tables created or already exist.");
  } catch (err) {
    console.error("Database initialization failed:", err);
    process.exit(1); // Exiting with failure status
  } finally {
    if (connection) connection.release(); // Release connection back to pool
  }
}
