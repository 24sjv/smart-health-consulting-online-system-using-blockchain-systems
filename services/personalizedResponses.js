/**
 * Personalized Responses Service
 * Integrates with backend data to provide personalized chatbot responses
 */

// Create a safe localStorage adapter that works in both browser and Node.js
const localStorage = (function() {
  // Check if we're in a browser environment
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage;
  }
  
  // Create a mock localStorage for server-side
  const store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => store[key] = String(value),
    removeItem: (key) => delete store[key],
    clear: () => Object.keys(store).forEach(key => delete store[key])
  };
})();

/**
 * Safely parse JSON data from storage
 * @param {string} key - Storage key
 * @param {Array|Object} defaultValue - Default value if parsing fails
 * @returns {Array|Object} Parsed data or default value
 */
function safeGetData(key, defaultValue = []) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (error) {
    console.error(`Error parsing ${key} data:`, error);
    return defaultValue;
  }
}

/**
 * Get personalized data from storage
 * @param {string} role - User role (patient or doctor)
 * @param {object} context - Context information including user IDs
 * @returns {object} Object containing personalized data
 */
function getPersonalizedData(role, context) {
  try {
    let userData = {};

    if (role === 'patient') {
      // Get patient's own data
      const patients = safeGetData('patients', []);
      const currentPatient = patients.find(p => p.id === context.patientId);

      // Get patient's appointments
      const appointments = safeGetData('appointments', []);
      const patientAppointments = appointments.filter(a => a.patientId === context.patientId);

      // Get patient's prescriptions from appointments
      const prescriptions = patientAppointments
        .filter(a => a.prescription)
        .map(a => ({
          date: a.appointmentDate,
          doctor: a.doctorName,
          prescription: a.prescription,
          condition: a.disease
        }));

      userData = {
        patient: currentPatient || {},
        appointments: patientAppointments || [],
        prescriptions: prescriptions || [],
        upcomingAppointment: patientAppointments.find(a => 
          a.status === 'Scheduled' || a.status === 'Accepted'
        )
      };
    } 
    else if (role === 'doctor') {
      // Get doctor's own data
      const doctors = safeGetData('doctors', []);
      const currentDoctor = doctors.find(d => d.id === context.doctorId);

      // Get doctor's appointments
      const appointments = safeGetData('appointments', []);
      const doctorAppointments = appointments.filter(a => a.doctorId === context.doctorId);

      // Get patients the doctor has seen
      const patients = safeGetData('patients', []);
      const patientIds = [...new Set(doctorAppointments.map(a => a.patientId))];
      const doctorPatients = patients.filter(p => patientIds.includes(p.id));

      // Get today's appointments
      const today = new Date().toISOString().split('T')[0];
      const todayAppointments = doctorAppointments.filter(a => a.appointmentDate === today);

      userData = {
        doctor: currentDoctor || {},
        appointments: doctorAppointments || [],
        patients: doctorPatients || [],
        todayAppointments: todayAppointments || [],
        pendingAppointments: doctorAppointments.filter(a => a.status === 'Scheduled') || []
      };
    }

    return userData;
  } catch (error) {
    console.error('Error getting personalized data:', error);
    return {};
  }
}

/**
 * Enhance a chatbot response with personalized information
 * @param {string} response - Original response
 * @param {string} role - User role (patient or doctor)
 * @param {string} message - User's message
 * @param {object} context - Context information including user IDs
 * @returns {string} Enhanced response with personalized data
 */
function enhanceResponseWithPersonalData(response, role, message, context) {
  try {
    const lowerMessage = message.toLowerCase();
    const userData = getPersonalizedData(role, context);
    let enhancedResponse = response;

    // Patient-specific personalizations
    if (role === 'patient') {
      const { patient, appointments, prescriptions, upcomingAppointment } = userData;

      // Personalize greeting
      if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage === 'hey') {
        const timeOfDay = getTimeOfDay();
        return `Good ${timeOfDay}, ${patient.firstName || 'there'}! How can I help you with your healthcare today?`;
      }

      // Appointments related query
      if (lowerMessage.includes('my appointment') || lowerMessage.includes('upcoming appointment')) {
        if (upcomingAppointment) {
          const formattedDate = formatDate(upcomingAppointment.appointmentDate);
          const doctor = upcomingAppointment.doctorName || 'your doctor';
          return `You have an upcoming appointment on ${formattedDate} at ${upcomingAppointment.appointmentTime || 'the scheduled time'} with ${doctor} for ${upcomingAppointment.disease || 'your condition'}.`;
        } else {
          return "You don't have any upcoming appointments scheduled. Would you like to book a new appointment?";
        }
      }

      // Prescription related query
      if (lowerMessage.includes('my prescription') || lowerMessage.includes('my medication')) {
        if (prescriptions.length > 0) {
          const latestPrescription = prescriptions[prescriptions.length - 1];
          return `Your most recent prescription was for ${latestPrescription.condition || 'your condition'}, prescribed by ${latestPrescription.doctor || 'your doctor'} on ${formatDate(latestPrescription.date)}. It includes: ${latestPrescription.prescription.substring(0, 100)}${latestPrescription.prescription.length > 100 ? '...' : ''}`;
        } else {
          return "You don't have any prescriptions in your records. If you need a prescription, please book an appointment with a doctor.";
        }
      }

      // Medical history related query
      if (lowerMessage.includes('my history') || lowerMessage.includes('my medical history')) {
        if (patient.medicalHistory) {
          return `Your medical history includes: ${patient.medicalHistory}. You can view more details in your profile section.`;
        } else {
          return "Your detailed medical history is available in your profile section. You can update it to help doctors provide better care.";
        }
      }
    }

    // Doctor-specific personalizations
    if (role === 'doctor') {
      const { doctor, appointments, patients, todayAppointments, pendingAppointments } = userData;

      // Personalize greeting
      if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage === 'hey') {
        const timeOfDay = getTimeOfDay();
        return `Good ${timeOfDay}, Dr. ${doctor.lastName || doctor.fullName?.split(' ')[1] || 'there'}! How can I assist with your practice today?`;
      }

      // Today's schedule
      if (lowerMessage.includes('today') || lowerMessage.includes('my schedule')) {
        if (todayAppointments.length > 0) {
          return `You have ${todayAppointments.length} appointment${todayAppointments.length > 1 ? 's' : ''} scheduled for today. ${todayAppointments.length > 1 ? 'Your next appointment is' : 'It is'} with ${todayAppointments[0].fullName || 'a patient'} at ${todayAppointments[0].appointmentTime || 'the scheduled time'}.`;
        } else {
          return "You don't have any appointments scheduled for today.";
        }
      }

      // Pending appointments
      if (lowerMessage.includes('pending') || lowerMessage.includes('new appointment')) {
        if (pendingAppointments.length > 0) {
          return `You have ${pendingAppointments.length} pending appointment${pendingAppointments.length > 1 ? 's' : ''} that need your attention. You can review them in the Appointments section.`;
        } else {
          return "You don't have any pending appointments that need your attention at this time.";
        }
      }

      // Patient count
      if (lowerMessage.includes('how many patient') || lowerMessage.includes('patient count')) {
        return `You currently have ${patients.length} patient${patients.length !== 1 ? 's' : ''} under your care.`;
      }
    }

    return enhancedResponse;
  } catch (error) {
    console.error('Error enhancing response with personal data:', error);
    return response; // Return original response if there's an error
  }
}

/**
 * Get appropriate greeting based on time of day
 * @returns {string} Time of day (morning, afternoon, or evening)
 */
function getTimeOfDay() {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 18) return 'afternoon';
  return 'evening';
}

/**
 * Format date for display
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date
 */
function formatDate(dateString) {
  if (!dateString) return 'the scheduled date';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    return dateString;
  }
}

module.exports = {
  enhanceResponseWithPersonalData,
  getPersonalizedData
}; 