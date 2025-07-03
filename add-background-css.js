const fs = require('fs');
const path = require('path');

// List of HTML files to update (excluding node_modules)
const htmlFiles = [
  'index.html',
  'doctor-register.html',
  'doctor-login.html',
  'doctor-dashboard.html',
  'view-prescriptions.html',
  'view-appointments.html',
  'admin-view-patients.html',
  'admin-view-doctors.html',
  'admin-view-appointments.html',
  'admin-login.html',
  'admin-controls.html',
  'appointment-confirmation.html',
  'patient-login.html',
  'patient-dashboard.html',
  'register-choice.html',
  'login-choice.html',
  'patient-registration.html',
  'patient-register.html'
];

// Counters
let successCount = 0;
let errorCount = 0;
let notFoundCount = 0;

// Function to add background CSS link to HTML files
function addBackgroundCssLink(filePath) {
  try {
    console.log(`Processing: ${path.basename(filePath)}`);
    
    // Read the file content
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if the background.css is already included
    if (content.includes('/public/css/background.css')) {
      console.log(`ℹ️ Background CSS already added: ${path.basename(filePath)}`);
      successCount++;
      return;
    }
    
    // Insert the background CSS link after the first </title> tag
    const updatedContent = content.replace(
      '</title>',
      '</title>\n    <link rel="stylesheet" href="/public/css/background.css">'
    );
    
    // Save the updated file
    fs.writeFileSync(filePath, updatedContent, 'utf8');
    console.log(`✅ Added background CSS to: ${path.basename(filePath)}`);
    successCount++;
    
  } catch (error) {
    console.error(`❌ Error updating ${path.basename(filePath)}: ${error.message}`);
    errorCount++;
  }
}

// Process each HTML file
htmlFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  
  // Check if file exists before processing
  if (fs.existsSync(filePath)) {
    addBackgroundCssLink(filePath);
  } else {
    console.log(`⚠️ File not found: ${path.basename(filePath)}`);
    notFoundCount++;
  }
});

// Summary report
console.log('\nBACKGROUND CSS LINK ADDITION SUMMARY:');
console.log(`✅ Successfully processed: ${successCount} files`);
console.log(`⚠️ Files not found: ${notFoundCount}`);
console.log(`❌ Errors encountered: ${errorCount}`);
console.log('\nCompleted! The stethoscope background CSS has been linked to all HTML files.');
