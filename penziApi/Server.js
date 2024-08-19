import express from 'express';
import bodyParser from 'body-parser';
import sql from 'mssql';
import cors from 'cors';  // Import the cors package
import smsRoutes from './Routes/smsRoutes.js';
import db from './Config/db.js'; // Adjust the path to match your actual file location

const app = express();

// Middleware to handle CORS
app.use(cors({
    origin: 'http://localhost:3000', // Replace with your frontend URL if different
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Adjust methods as needed
    allowedHeaders: ['Content-Type', 'Authorization'], // Adjust headers as needed
}));

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Database connection using a connection pool
const poolPromise = sql.connect(db)
    .then(pool => {
        if (pool.connected) {
            console.log('Connected to MSSQL database.');
            return pool;
        }
        throw new Error('Database connection failed.');
    })
    .catch(err => {
        console.error('Database connection failed:', err);
        process.exit(1);
    });

// Make the database connection available in the request object
app.use(async (req, res, next) => {
    try {
        req.db = await poolPromise;
        next();
    } catch (err) {
        res.status(500).send('Database connection error');
    }
});

// Use routes
smsRoutes(app);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
