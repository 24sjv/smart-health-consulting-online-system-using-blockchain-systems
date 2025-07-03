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
let totalModified = 0;

// Function to update background image in HTML files
function updateBackgroundImage(filePath) {
  try {
    console.log(`Processing: ${path.basename(filePath)}`);
    
    // Read the file content
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    
    // Replace all URLs in background-image properties
    content = content.replace(
      /background-image:\s*url\(['"]https:\/\/[^'"]+['"]\)/g, 
      "background-image: url('/public/images/stethoscope-bg.jpg')"
    );
    
    // Replace all URLs with !important flag
    content = content.replace(
      /background-image:\s*url\(['"]https:\/\/[^'"]+['"]\)\s*!important/g, 
      "background-image: url('/public/images/stethoscope-bg.jpg') !important"
    );
    
    // Check if content was modified
    if (content !== originalContent) {
      // Save the file
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Updated: ${path.basename(filePath)}`);
      totalModified++;
    } else {
      console.log(`ℹ️ No changes needed: ${path.basename(filePath)}`);
    }
    
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
    updateBackgroundImage(filePath);
  } else {
    console.log(`⚠️ File not found: ${path.basename(filePath)}`);
    notFoundCount++;
  }
});

// Summary report
console.log('\nBACKGROUND IMAGE UPDATE SUMMARY:');
console.log(`✅ Successfully processed: ${successCount} files`);
console.log(`🔄 Files with background changes: ${totalModified} files`);
console.log(`⚠️ Files not found: ${notFoundCount}`);
console.log(`❌ Errors encountered: ${errorCount}`);
console.log('\nCompleted! The stethoscope background has been applied.');
