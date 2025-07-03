/**
 * Blockchain Widget for Healthcare Application
 */

class BlockchainWidget {
  constructor(options = {}) {
    this.containerSelector = options.container || '#blockchain-status';
    this.autoUpdate = options.autoUpdate !== undefined ? options.autoUpdate : true;
    this.updateInterval = options.updateInterval || 60000; // 1 minute default
    this.isConnected = false;
    this.networkId = null;
    this.nodeInfo = null;
    
    this.init();
  }
  
  async init() {
    this.container = document.querySelector(this.containerSelector);
    
    if (!this.container) {
      console.warn('Blockchain widget container not found:', this.containerSelector);
      return;
    }
    
    await this.updateStatus();
    
    if (this.autoUpdate) {
      this.startAutoUpdate();
    }
  }
  
  async updateStatus() {
    try {
      const response = await fetch('/api/health');
      const data = await response.json();
      
      if (data && data.services && data.services.blockchain) {
        const { connected, networkId, node, error } = data.services.blockchain;
        
        this.isConnected = connected;
        this.networkId = networkId;
        this.nodeInfo = node;
        this.error = error;
        
        this.render();
      }
    } catch (error) {
      console.error('Failed to update blockchain status:', error);
      this.isConnected = false;
      this.error = error.message;
      this.render();
    }
  }
  
  startAutoUpdate() {
    this.updateTimer = setInterval(() => {
      this.updateStatus();
    }, this.updateInterval);
  }
  
  stopAutoUpdate() {
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
      this.updateTimer = null;
    }
  }
  
  render() {
    if (!this.container) return;
    
    const statusClass = this.isConnected ? 'connected' : 'disconnected';
    const statusIcon = this.isConnected ? '✅' : '❌';
    
    this.container.innerHTML = `
      <div class="blockchain-widget ${statusClass}">
        <div class="blockchain-status">
          <span class="status-icon">${statusIcon}</span>
          <span class="status-text">${this.isConnected ? 'Connected' : 'Disconnected'}</span>
        </div>
        ${this.isConnected ? `
          <div class="blockchain-details">
            <div class="detail-item">
              <span class="detail-label">Network ID:</span>
              <span class="detail-value">${this.networkId}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Node:</span>
              <span class="detail-value">${this.nodeInfo}</span>
            </div>
          </div>
        ` : `
          <div class="blockchain-error">
            ${this.error ? `Error: ${this.error}` : 'Unable to connect to blockchain'}
          </div>
        `}
      </div>
    `;
  }
  
  destroy() {
    this.stopAutoUpdate();
  }
}

// Initialize global BlockchainWidget
window.BlockchainWidget = BlockchainWidget;

// Auto-initialize if container exists
document.addEventListener('DOMContentLoaded', () => {
  const container = document.querySelector('#blockchain-status');
  if (container) {
    window.blockchainWidgetInstance = new BlockchainWidget({
      container: '#blockchain-status'
    });
  }
});
