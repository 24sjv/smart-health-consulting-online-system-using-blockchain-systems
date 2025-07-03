const { createServer } = require("ganache");

// Create and start server
const server = createServer({
  logging: { quiet: false }
});

// Start server on port 8545
server.listen(8545, function(err) {
  if (err) {
    console.error(err);
    return;
  }
  console.log("Ganache blockchain started on port 8545");
  console.log("RPC URL: http://localhost:8545");
}); 