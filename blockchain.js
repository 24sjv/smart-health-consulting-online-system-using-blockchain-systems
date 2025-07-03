const ganache = require("ganache");

// Create server with default options
const server = ganache.server({
  wallet: {
    // Generate deterministic accounts with 100 ETH each
    deterministic: true,
    totalAccounts: 10,
    defaultBalance: 100
  },
  logging: {
    quiet: false
  },
  chain: {
    chainId: 1337
  }
});

// Start server
const PORT = 8545;
server.listen(PORT, async err => {
  if (err) {
    console.error(err);
    return;
  }
  
  console.log(`\n🔗 Local blockchain started!`);
  console.log(`RPC URL: http://localhost:${PORT}`);
  
  // Display available accounts
  const provider = server.provider;
  const accounts = await provider.request({ method: "eth_accounts" });
  
  console.log(`\n📋 Available Accounts (100 ETH each):`);
  accounts.forEach((account, i) => {
    console.log(`(${i}) ${account}`);
  });
  
  console.log(`\n✅ Blockchain ready for connections`);
  console.log(`Chain ID: 1337`);
}); 