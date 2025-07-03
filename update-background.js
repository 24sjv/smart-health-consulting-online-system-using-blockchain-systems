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

// Function to update background image in HTML files
function updateBackgroundImage(filePath) {
  try {
    // Read the file content
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace any background image URLs with our stethoscope image
    // This pattern matches background-image: url('...') with various URLs
    let updatedContent = content.replace(
      /background-image:\s*url\(['"](https?:\/\/[^'"]+)['"]\)/g,
      "background-image: url('/public/images/stethoscope-bg.jpg')"
    );
    
    // Save the file
    fs.writeFileSync(filePath, updatedContent, 'utf8');
    console.log(`✅ Updated: ${filePath}`);
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message);
  }
}

// Process each HTML file
htmlFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  
  // Check if file exists before processing
  if (fs.existsSync(filePath)) {
    updateBackgroundImage(filePath);
  } else {
    console.log(`⚠️ File not found: ${filePath}`);
  }
});

console.log('Background image update completed!');
