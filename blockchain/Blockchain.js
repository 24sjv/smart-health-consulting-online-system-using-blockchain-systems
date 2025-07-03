const Block = require('./Block');
const BlockchainRecord = require('../models/blockchainRecord');

class Blockchain {
  constructor() {
    this.chain = [];
    this.difficulty = 2;
  }

  async initializeChain() {
    // Check if we have blocks in the database
    const blocksCount = await BlockchainRecord.countDocuments();
    
    if (blocksCount === 0) {
      // No blocks in database, create genesis block
      await this.createGenesisBlock();
    } else {
      // Load chain from database
      await this.loadChainFromDB();
    }
  }

  async createGenesisBlock() {
    const genesisBlock = new Block(0, Date.now(), { message: 'Genesis Block for Health App' }, '0');
    genesisBlock.mineBlock(this.difficulty);
    
    // Save to database
    const blockRecord = new BlockchainRecord({
      hash: genesisBlock.hash,
      previousHash: genesisBlock.previousHash,
      timestamp: new Date(genesisBlock.timestamp),
      data: genesisBlock.data,
      nonce: genesisBlock.nonce,
      recordType: 'MedicalRecord',
      relatedEntityId: '000000000000000000000000',  // Placeholder ObjectId
      signature: 'GenesisBlock'
    });
    
    await blockRecord.save();
    
    this.chain.push(genesisBlock);
    return genesisBlock;
  }

  async loadChainFromDB() {
    const blocks = await BlockchainRecord.find().sort({ timestamp: 1 });
    this.chain = blocks.map(block => {
      const newBlock = new Block(
        block.index || blocks.indexOf(block),
        new Date(block.timestamp).getTime(),
        block.data,
        block.previousHash
      );
      newBlock.hash = block.hash;
      newBlock.nonce = block.nonce;
      return newBlock;
    });
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  async addBlock(data, recordType, relatedEntityId, signature) {
    const latestBlock = this.getLatestBlock();
    const newBlock = new Block(
      this.chain.length,
      Date.now(),
      data,
      latestBlock.hash
    );
    
    newBlock.mineBlock(this.difficulty);
    
    // Save to database
    const blockRecord = new BlockchainRecord({
      hash: newBlock.hash,
      previousHash: newBlock.previousHash,
      timestamp: new Date(newBlock.timestamp),
      data: newBlock.data,
      nonce: newBlock.nonce,
      recordType,
      relatedEntityId,
      signature
    });
    
    await blockRecord.save();
    
    this.chain.push(newBlock);
    return newBlock;
  }

  isChainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      if (!currentBlock.isValid()) {
        return false;
      }

      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }
    }
    return true;
  }

  async getBlockByHash(hash) {
    return await BlockchainRecord.findOne({ hash });
  }

  async getBlocksByEntity(relatedEntityId) {
    return await BlockchainRecord.find({ relatedEntityId }).sort({ timestamp: -1 });
  }

  async getBlocksByType(recordType) {
    return await BlockchainRecord.find({ recordType }).sort({ timestamp: -1 });
  }
}

module.exports = Blockchain;
