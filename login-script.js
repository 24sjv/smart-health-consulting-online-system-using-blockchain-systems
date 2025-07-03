// Example of setting patient ID on login
function handleLogin() {
    const patientId = 'somePatientId'; // This should be dynamically retrieved based on login
    localStorage.setItem('currentPatientId', patientId);
    window.location.href = 'patient-dashboard.html'; // Redirect to dashboard after login
} 