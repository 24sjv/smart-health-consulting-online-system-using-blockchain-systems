# Smart Health Consulting Online System Based On Blockchain

## Overview
This project is a healthcare application that leverages blockchain technology for secure and transparent health consultations. It includes features for user authentication, health record management, and blockchain-based transaction logging.

## Technologies
- **Backend**: Node.js, Express
- **Frontend**: HTML, CSS, JavaScript
- **Blockchain**: Custom blockchain implementation (see `blockchain.js`)
- **Database**: (If any, but from the files we don't see one, so maybe not mentioned or using files)
- **Dependencies**: 
  - `@google/generative-ai`: For AI-based health insights
  - `axios`: For HTTP requests
  - `bcryptjs`: For password hashing
  - `body-parser`: For parsing request bodies
  - `cors`: For enabling CORS
  - `crypto-js`: For cryptographic functions
  - `csv-parser`: For parsing CSV files (if used)
  - `dotenv`: For environment variables
  - `express`: Web framework

## System Requirements

To run this application, you need:
- **Node.js** (version 14 or higher recommended)
- **npm** (Node Package Manager, usually bundled with Node.js)
- **Windows Operating System** (for batch file support)
- **Git** (for cloning the repository)
- **Basic understanding of blockchain concepts** (to understand the implementation)

## Setup and Run Process

Follow these steps to set up and run the application:

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-repository-url.git
   cd Smart-Health-consulting-Online-System-Based-On-Blockchain-Systems
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Create environment configuration**:
   - Create a `.env` file in the root directory
   - Add required environment variables:
     ```env
     PORT=3000
     BLOCKCHAIN_NETWORK_ENDPOINT=http://your-blockchain-network
     # Add other required variables here
     ```

4. **Run the application** (choose one method):
   - **Using npm scripts**:
     ```bash
     npm start       # Production mode
     npm run dev     # Development mode with live reload (requires nodemon)
     npm run blockchain  # Run blockchain component separately
     ```
   
   - **Directly via Node.js**:
     ```bash
     node server.js
     ```
   
   - **Using Windows batch file**:
     - Double-click `start.bat` or run from command prompt:
       ```bash
       start.bat
       ```

5. **Access the application**:
   - Open web browser and go to `http://localhost:3000`
   - Interact with the healthcare blockchain system

## Project Structure
- `server.js`: Main server entry point
- `blockchain.js`: Blockchain implementation
- `public/`: Static files (CSS, JS, images)
- `views/`: HTML templates (if using a templating engine, but we see HTML files in root)
- `package.json`: Project dependencies and scripts

## Usage
After starting the server, open your web browser and navigate to `http://localhost:3000` (or the port specified in your environment).

## Note
This project uses a custom blockchain implementation for demonstration purposes. For production, consider using a more robust blockchain framework.
