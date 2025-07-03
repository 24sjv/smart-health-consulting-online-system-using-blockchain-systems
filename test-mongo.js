// Simple MongoDB connection test
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/healthapp', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('MongoDB connected successfully!');
  console.log('Your MongoDB connection is working properly.');
  process.exit(0);
})
.catch(err => {
  console.error('MongoDB connection error:', err);
  console.log('\nTroubleshooting tips:');
  console.log('1. Make sure MongoDB is installed on your system');
  console.log('2. Ensure MongoDB service is running');
  console.log('3. If using MongoDB Atlas or other cloud service, check your internet connection');
  console.log('4. Verify the connection string in your .env file is correct');
  process.exit(1);
});
