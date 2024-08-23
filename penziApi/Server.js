import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import smsRoutes from './Routes/smsRoutes.js';
import { initializeDatabase } from './Controllers/dbinit.js';

const app = express();

// Middleware to handle CORS
app.use(cors({
  origin: 'http://localhost:3000', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'], 
  allowedHeaders: ['Content-Type', 'Authorization'], 
}));

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Initialize the database and then start the server
initializeDatabase()
  .then(() => {
    // Set up routes after the database has been initialized
    smsRoutes(app);

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to initialize the database:', err);
    process.exit(1); // Exit the process with a failure code if initialization fails
  });
