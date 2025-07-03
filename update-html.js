// Script to update HTML files to include our JavaScript files without modifying the UI
const fs = require('fs');
const path = require('path');

const htmlFiles = [
  'index.html',
  'patient-login.html',
  'doctor-login.html',
  'admin-login.html',
  'patient-dashboard.html',
  'doctor-dashboard.html',
  'admin-controls.html',
  'admin-view-patients.html',
  'admin-view-doctors.html',
  'admin-view-appointments.html',
  'patient-register.html',
  'doctor-register.html',
  'login-choice.html',
  'register-choice.html'
];

// JavaScript files to include before closing body tag
const jsFiles = [
  '/public/js/api.js',
  '/public/js/blockchain-widget.js',
  '/public/js/init.js'
];

// Update each HTML file
htmlFiles.forEach(htmlFile => {
  const filePath = path.join(__dirname, htmlFile);
  
  // Check if file exists
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if scripts are already included
    const hasApiJs = content.includes('api.js');
    const hasBlockchainWidget = content.includes('blockchain-widget.js');
    const hasInitJs = content.includes('init.js');
    
    if (hasApiJs && hasBlockchainWidget && hasInitJs) {
      console.log(`${htmlFile} already has all scripts included.`);
      return;
    }
    
    // Find the closing body tag
    const bodyCloseIndex = content.lastIndexOf('</body>');
    
    if (bodyCloseIndex !== -1) {
      // Create script tags
      const scriptTags = jsFiles
        .map(file => `  <script src="${file}"></script>`)
        .join('\n');
      
      // Insert script tags before closing body tag
      const updatedContent = 
        content.substring(0, bodyCloseIndex) + 
        '\n  <!-- Auto-injected scripts for blockchain and MongoDB integration -->\n' +
        scriptTags + 
        '\n' + 
        content.substring(bodyCloseIndex);
      
      // Write updated content
      fs.writeFileSync(filePath, updatedContent, 'utf8');
      console.log(`Updated ${htmlFile} to include necessary scripts.`);
    } else {
      console.log(`Could not find closing body tag in ${htmlFile}.`);
    }
  } else {
    console.log(`File ${htmlFile} does not exist.`);
  }
});

console.log('HTML update completed.');
