// StarUML JavaScript API Script for HealthCare Use Case Diagram
// To use this script:
// 1. Open StarUML
// 2. Go to Tools > Extension Manager and install "JavaScript" extension if not already installed
// 3. Go to Tools > Scripts... > Import and select this file
// 4. Run the script from Tools > Scripts... > create_healthcare_diagram

function main() {
    // Create a new project
    var project = app.repository.createModel("Project", "Smart Health Consulting System");
    
    // Create a UML model
    var model = app.repository.createModel("UMLModel", "Health System Model", null, project);
    
    // Create a use case diagram
    var diagram = app.repository.createModel("UMLUseCaseDiagram", "Health System Use Case Diagram", null, model);
    
    // Create Actors
    var actorPatient = app.repository.createModel("UMLActor", "Patient", null, diagram);
    var actorDoctor = app.repository.createModel("UMLActor", "Doctor", null, diagram);
    var actorAdmin = app.repository.createModel("UMLActor", "Administrator", null, diagram);
    var actorPayment = app.repository.createModel("UMLActor", "Payment System", null, diagram);
    var actorBlockchain = app.repository.createModel("UMLActor", "Blockchain System", null, diagram);
    var actorAI = app.repository.createModel("UMLActor", "AI/Chatbot System", null, diagram);
    
    // Create Subsystems (Boundaries)
    var mainSystem = app.repository.createModel("UMLSubsystem", "Main Health System", null, diagram);
    var paymentSystem = app.repository.createModel("UMLSubsystem", "Payment Subsystem", null, diagram);
    var blockchainSystem = app.repository.createModel("UMLSubsystem", "Blockchain Subsystem", null, diagram);
    var aiSystem = app.repository.createModel("UMLSubsystem", "AI Subsystem", null, diagram);
    
    // Create Use Cases for Main System
    // Patient Use Cases
    var ucRegister = app.repository.createModel("UMLUseCase", "Register Account", null, mainSystem);
    var ucLogin = app.repository.createModel("UMLUseCase", "Login", null, mainSystem);
    var ucRequestAppt = app.repository.createModel("UMLUseCase", "Request Appointment", null, mainSystem);
    var ucViewAppt = app.repository.createModel("UMLUseCase", "View Appointments", null, mainSystem);
    var ucViewPresc = app.repository.createModel("UMLUseCase", "View Prescriptions", null, mainSystem);
    var ucMakePayment = app.repository.createModel("UMLUseCase", "Make Payments", null, mainSystem);
    var ucUpdateProfile = app.repository.createModel("UMLUseCase", "Update Profile", null, mainSystem);
    var ucFindHospitals = app.repository.createModel("UMLUseCase", "Find Nearby Hospitals", null, mainSystem);
    var ucVideoConsult = app.repository.createModel("UMLUseCase", "Participate in Video Consultation", null, mainSystem);
    var ucViewRecords = app.repository.createModel("UMLUseCase", "View Medical Records", null, mainSystem);
    var ucReportSymptoms = app.repository.createModel("UMLUseCase", "Report Symptoms", null, mainSystem);
    
    // Doctor Use Cases
    var ucDoctorLogin = app.repository.createModel("UMLUseCase", "Login (Doctor)", null, mainSystem);
    var ucViewSchedule = app.repository.createModel("UMLUseCase", "View Scheduled Appointments", null, mainSystem);
    var ucApproveReject = app.repository.createModel("UMLUseCase", "Approve/Reject Appointments", null, mainSystem);
    var ucIssuePresc = app.repository.createModel("UMLUseCase", "Issue Prescriptions", null, mainSystem);
    var ucViewPatientRec = app.repository.createModel("UMLUseCase", "View Patient Records", null, mainSystem);
    var ucUpdateDocProfile = app.repository.createModel("UMLUseCase", "Update Profile (Doctor)", null, mainSystem);
    var ucConductVideo = app.repository.createModel("UMLUseCase", "Conduct Video Consultations", null, mainSystem);
    var ucReferPatients = app.repository.createModel("UMLUseCase", "Refer Patients to Hospitals", null, mainSystem);
    
    // Admin Use Cases
    var ucAdminLogin = app.repository.createModel("UMLUseCase", "Login to Admin Dashboard", null, mainSystem);
    var ucManageDoctors = app.repository.createModel("UMLUseCase", "Manage Doctor Accounts", null, mainSystem);
    var ucManagePatients = app.repository.createModel("UMLUseCase", "Manage Patient Accounts", null, mainSystem);
    var ucViewAllAppts = app.repository.createModel("UMLUseCase", "View All Appointments", null, mainSystem);
    var ucGenReports = app.repository.createModel("UMLUseCase", "Generate Reports", null, mainSystem);
    var ucSysConfig = app.repository.createModel("UMLUseCase", "System Configuration", null, mainSystem);
    
    // Payment Subsystem Use Cases
    var ucProcessPayment = app.repository.createModel("UMLUseCase", "Process Payments", null, paymentSystem);
    var ucGenReceipt = app.repository.createModel("UMLUseCase", "Generate Payment Receipts", null, paymentSystem);
    var ucVerifyPayment = app.repository.createModel("UMLUseCase", "Handle Payment Verification", null, paymentSystem);
    
    // Blockchain Subsystem Use Cases
    var ucStoreRecords = app.repository.createModel("UMLUseCase", "Store Medical Records", null, blockchainSystem);
    var ucVerifyTrans = app.repository.createModel("UMLUseCase", "Verify Transactions", null, blockchainSystem);
    var ucMaintainData = app.repository.createModel("UMLUseCase", "Maintain Data Integrity", null, blockchainSystem);
    
    // AI Subsystem Use Cases
    var ucMedicalAdvice = app.repository.createModel("UMLUseCase", "Provide Medical Advice", null, aiSystem);
    var ucAnswerQueries = app.repository.createModel("UMLUseCase", "Answer Health Queries", null, aiSystem);
    var ucAssistHospital = app.repository.createModel("UMLUseCase", "Assist with Hospital Finding", null, aiSystem);
    var ucDiseaseAnalysis = app.repository.createModel("UMLUseCase", "Disease Analysis", null, aiSystem);
    
    // Create Associations (Actor to Use Case)
    // Patient Associations
    createAssociation(actorPatient, ucRegister);
    createAssociation(actorPatient, ucLogin);
    createAssociation(actorPatient, ucRequestAppt);
    createAssociation(actorPatient, ucViewAppt);
    createAssociation(actorPatient, ucViewPresc);
    createAssociation(actorPatient, ucMakePayment);
    createAssociation(actorPatient, ucUpdateProfile);
    createAssociation(actorPatient, ucFindHospitals);
    createAssociation(actorPatient, ucVideoConsult);
    createAssociation(actorPatient, ucViewRecords);
    createAssociation(actorPatient, ucReportSymptoms);
    
    // Doctor Associations
    createAssociation(actorDoctor, ucDoctorLogin);
    createAssociation(actorDoctor, ucViewSchedule);
    createAssociation(actorDoctor, ucApproveReject);
    createAssociation(actorDoctor, ucIssuePresc);
    createAssociation(actorDoctor, ucViewPatientRec);
    createAssociation(actorDoctor, ucUpdateDocProfile);
    createAssociation(actorDoctor, ucConductVideo);
    createAssociation(actorDoctor, ucReferPatients);
    
    // Admin Associations
    createAssociation(actorAdmin, ucAdminLogin);
    createAssociation(actorAdmin, ucManageDoctors);
    createAssociation(actorAdmin, ucManagePatients);
    createAssociation(actorAdmin, ucViewAllAppts);
    createAssociation(actorAdmin, ucGenReports);
    createAssociation(actorAdmin, ucSysConfig);
    
    // Payment System Associations
    createAssociation(actorPayment, ucProcessPayment);
    createAssociation(actorPayment, ucGenReceipt);
    createAssociation(actorPayment, ucVerifyPayment);
    
    // Blockchain System Associations
    createAssociation(actorBlockchain, ucStoreRecords);
    createAssociation(actorBlockchain, ucVerifyTrans);
    createAssociation(actorBlockchain, ucMaintainData);
    
    // AI System Associations
    createAssociation(actorAI, ucMedicalAdvice);
    createAssociation(actorAI, ucAnswerQueries);
    createAssociation(actorAI, ucAssistHospital);
    createAssociation(actorAI, ucDiseaseAnalysis);
    
    // Create Extends Relationships
    createExtends(ucRequestAppt, ucLogin);
    createExtends(ucViewAppt, ucLogin);
    createExtends(ucViewPresc, ucLogin);
    createExtends(ucIssuePresc, ucDoctorLogin);
    createExtends(ucManageDoctors, ucAdminLogin);
    createExtends(ucManagePatients, ucAdminLogin);
    createExtends(ucViewAllAppts, ucAdminLogin);
    
    // Create Includes Relationships
    createIncludes(ucMakePayment, ucProcessPayment);
    createIncludes(ucProcessPayment, ucGenReceipt);
    
    // Associate related use cases
    createAssociation(ucConductVideo, ucVideoConsult);
    
    // Layout the diagram (this is a placeholder - StarUML requires manual arrangement)
    // In a real script, you would use StarUML's layout API to position elements
    
    app.dialogs.showInfoDialog("Use Case Diagram Created", 
        "The Smart Health Consulting System use case diagram has been created.\n\n" +
        "Please manually arrange the elements for better visibility.");
    
    return project;
}

// Helper function to create UML Association
function createAssociation(source, target) {
    return app.repository.createModel("UMLAssociation", "", null, source, [target]);
}

// Helper function to create UML Extend relationship
function createExtends(extender, base) {
    var extend = app.repository.createModel("UMLExtend", "", null, extender);
    extend.target = base;
    return extend;
}

// Helper function to create UML Include relationship
function createIncludes(includer, includee) {
    var include = app.repository.createModel("UMLInclude", "", null, includer);
    include.target = includee;
    return include;
}

main();
