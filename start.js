// Application starter script
const server = require('./server');
const connectDB = require('./config/db');

// Connect to MongoDB
connectDB();

console.log('Health App with Blockchain and MongoDB started successfully!');
console.log('Navigate to http://localhost:3000 to use the application');
