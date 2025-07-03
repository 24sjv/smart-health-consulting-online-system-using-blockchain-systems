# Smart Health Consulting Online System Based On Blockchain Systems

A secure and decentralized platform for health consultations using blockchain technology for data integrity and transparency.

For detailed documentation, see [DOCUMENTATION.md](DOCUMENTATION.md).

# Health App with Blockchain and MongoDB Integration

This project extends your health application with blockchain technology and MongoDB for secure, immutable medical records and efficient data management.

## Features Added

### Blockchain Integration

- **Secure Medical Records**: Patient medical records are stored on a blockchain, providing immutability and security
- **Prescription Verification**: All prescriptions issued by doctors are recorded on the blockchain for verification
- **Doctor Credential Verification**: Doctor credentials and qualifications are verified and stored on the blockchain
- **Patient Consent Tracking**: Patient consent for data sharing and procedures is recorded immutably
- **Appointment Tracking**: Medical appointments are recorded on the blockchain for audit purposes

### MongoDB Integration

- **Patient Data**: Comprehensive storage of patient information, medical history, and appointments
- **Doctor Profiles**: Doctor credentials, specializations, availability, and appointment schedules
- **Appointment Management**: Complete appointment lifecycle tracking with status updates
- **Admin Dashboard**: Statistics and management capabilities for administrators

### API Endpoints

The application now features a comprehensive API with these main categories:

1. **Patient APIs**: Registration, login, profile management, medical history
2. **Doctor APIs**: Registration, login, appointment management, prescription issuance
3. **Admin APIs**: Dashboard statistics, user management, verification processes
4. **Blockchain APIs**: Record verification, chain status, record retrieval by various parameters

## Technical Implementation

- **Backend**: Node.js with Express
- **Database**: MongoDB for flexible schema data storage
- **Blockchain**: Custom implementation using SHA-256 hashing and proof-of-work
- **Authentication**: JWT-based authentication for secure API access
- **API Client**: JavaScript client for easy frontend integration

## Getting Started

### Prerequisites

- Node.js (v14+)
- MongoDB (local or Atlas cloud instance)

### Installation

1. Install dependencies:
   ```
   npm install
   ```

2. Configure your environment variables in the `.env` file:
   ```
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/healthapp
   JWT_SECRET=your_secret_jwt_key_change_this_in_production
   ```

3. Start the server:
   ```
   npm start
   ```

## Using the API Client

The API client is available globally through the `HealthAppAPI` object:

```javascript
// Patient registration example
const registerPatient = async () => {
  const result = await HealthAppAPI.patient.register({
    name: "John Doe",
    email: "john@example.com",
    password: "password123",
    age: 35,
    gender: "Male"
  });

  if (result.success) {
    console.log("Registration successful:", result.data);
  } else {
    console.error("Registration failed:", result.message);
  }
};

// Check blockchain record example
const verifyRecord = async (hash) => {
  const result = await HealthAppAPI.blockchain.getRecordByHash(hash);
  console.log("Blockchain record:", result.data);
};
```

## Security Features

- Password hashing using bcrypt
- JWT for secure authentication
- Blockchain verification for data integrity
- Immutable audit trail for all medical actions

# Healthcare App with Offline AI Assistant

This healthcare application includes an AI-powered assistant that can run offline using local AI models like Mistral or Llama 3.

## Features

- Patient dashboard with appointment booking, prescription viewing
- Doctor dashboard for managing appointments and prescriptions
- Admin controls for managing doctors and patients
- **Local AI Assistant** that works offline for enhanced privacy and reliability

## Setup

### Basic Installation

```bash
# Clone the repository
git clone <repository-url>
cd healthcare-app

# Install dependencies
npm install

# Create .env file (optional)
cp .env.example .env

# Start the application (without AI)
npm start
```

### Installing with Offline AI Support

The application supports offline AI assistants using models like Mistral and Llama 3. To use this feature:

1. Install Python dependencies:

```bash
pip install transformers sentencepiece torch
```

2. Start the server with AI support:

```bash
npm run start:ai
```

### Customizing the AI Model

You can modify the model used by editing `services/localAssistant.js`:

```javascript
// Default model (smaller, faster)
model = await pipeline('text-generation', 'mistralai/Mistral-7B');

// Alternative models:
// Larger model with better responses (needs more RAM)
// model = await pipeline('text-generation', 'meta-llama/Llama-3-8B');

// Smallest model (faster but less capable)
// model = await pipeline('text-generation', 'TheBloke/TinyLlama-1.1B');
```

## Usage

Once the application is running:

1. Access the app at http://localhost:3000
2. Register as a patient or doctor
3. Explore the dashboards and interact with the AI assistant
4. The AI assistant will automatically use the local model if available

## Offline Mode

The AI assistant has three operational modes:

1. **Online with API Fallback** (default): Uses the rule-based responses
2. **Online with Local AI**: Uses local models like Mistral that run on your computer
3. **Fully Offline**: Works without internet connection using local models

To enable fully offline mode, start the server with:

```bash
USE_LOCAL_MODEL=true OFFLINE_MODE=true npm start
```

## System Requirements for Local AI

- **Minimum**: 8GB RAM, dual-core CPU
- **Recommended**: 16GB+ RAM, quad-core CPU
- **Storage**: ~4GB for Mistral 7B model (downloaded automatically)
- **GPU**: Optional but recommended for better performance

## Troubleshooting

If you encounter issues with the local AI model:

1. Check if you have enough RAM (models require significant memory)
2. Try using a smaller model by editing `services/localAssistant.js`
3. Ensure you have installed all Python dependencies
4. Check the server logs for detailed error messages

# Healthcare App with Enhanced Chatbot Integration

This healthcare application includes both an AI-powered assistant and a rule-based chatbot with personalized responses based on patient and doctor data.

## Features

- Patient dashboard with appointment booking, prescription viewing
- Doctor dashboard for managing appointments and prescriptions
- Admin controls for managing doctors and patients
- **Advanced Dual-Layer Chatbot System**:
  - AI Assistant that works with local models for enhanced privacy
  - Rule-based chatbot with comprehensive medical knowledge
  - **Personalized responses** based on actual patient/doctor data
  - Automatic fallback system for reliable operation

## Chatbot Implementation

The application features a sophisticated multi-layered chatbot system:

### 1. AI-Powered Assistant
- Uses local AI models like Mistral or Llama 3
- Provides more natural, context-aware responses
- Requires more system resources

### 2. Rule-Based Medical Knowledge Base
- Works without any AI dependencies
- Contains comprehensive medical information:
  - Symptoms, treatments, and prevention for 15+ conditions
  - Medication information for major drug categories
  - Specialist information and which conditions they treat
  - 25+ FAQ responses on common medical topics

### 3. Personalized Response Layer
- Connects to user data (appointments, prescriptions, medical history)
- Provides custom responses based on:
  - Patient's upcoming appointments
  - Patient's prescription history
  - Doctor's schedule and pending appointments
  - Patient count and management information
- Shows "Personalized" badge for data-specific information

## Setup

### Basic Installation (Rule-Based Chatbot Only)

```bash
# Clone the repository
git clone <repository-url>
cd healthcare-app

# Install dependencies
npm install

# Start the application (with rule-based chatbot only)
npm start
```

### Installing with AI Support (Optional)

For enhanced chatbot capabilities:

1. Install Rust (required for some Python packages):
   ```bash
   # Windows: Download from https://rustup.rs/
   # Linux/MacOS:
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   ```

2. Install Python dependencies:
   ```bash
   pip install torch
   pip install transformers sentencepiece
   ```

3. Start the server with AI support:
   ```bash
   npm run start:ai
   ```

## Using the Chatbot

The chatbot appears as a floating bubble in the bottom-left corner of both patient and doctor dashboards:

1. Click on the "HealthBot" button to expand the chat interface
2. Type your question and press Enter or click Send
3. The system will automatically use the best available option:
   - AI Assistant if available
   - Personalized response if data is relevant to the question
   - Rule-based chatbot as fallback

### Patient-Specific Features

Patients can ask about:
- Their upcoming appointments
- Their prescription history
- Their medical records
- General medical information

### Doctor-Specific Features

Doctors can ask about:
- Today's schedule
- Pending appointments
- Patient counts
- Clinical procedures and tools

## Extending the Chatbot

### Adding New Medical Knowledge

To add new medical information to the rule-based chatbot, edit `services/localChatbot.js`:

```javascript
// Add new symptoms
medicalKnowledgeBase.symptoms.diabetes = ["frequent urination", "increased thirst", "fatigue", "blurred vision"];

// Add new treatments
medicalKnowledgeBase.treatments.diabetes = ["insulin therapy", "blood sugar monitoring", "healthy diet", "regular exercise"];

// Add new FAQ responses
faqResponses["diabetes symptoms"] = "Common symptoms of diabetes include frequent urination, increased thirst, fatigue, and blurred vision.";
```

### Adding New Personalized Response Types

To add new personalized response types, edit `services/personalizedResponses.js`:

```javascript
// Inside enhanceResponseWithPersonalData function
if (role === 'patient') {
  // Add new patient-specific personalization
  if (lowerMessage.includes('my lab results') || lowerMessage.includes('my tests')) {
    // Access from patient data
    if (patient.labResults && patient.labResults.length > 0) {
      return `Your most recent lab results are from ${formatDate(patient.labResults[0].date)}. You can view details in your profile.`;
    }
  }
}
```
