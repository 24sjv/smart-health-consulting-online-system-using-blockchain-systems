/**
 * Local Chatbot Service
 * A rule-based medical chatbot that can be used as a fallback when AI models are unavailable
 */

const medicalKnowledgeBase = {
  symptoms: {
    flu: ["fever", "cough", "fatigue", "body aches", "sore throat"],
    covid: ["fever", "cough", "shortness of breath", "loss of taste or smell"],
    cold: ["runny nose", "sneezing", "sore throat", "mild cough"],
    allergies: ["sneezing", "itchy eyes", "runny nose", "rash"],
    hypertension: ["headache", "shortness of breath", "nosebleeds", "dizziness"],
    diabetes: ["frequent urination", "increased thirst", "fatigue", "blurred vision", "slow wound healing", "unexplained weight loss"],
    asthma: ["wheezing", "shortness of breath", "chest tightness", "coughing", "trouble sleeping due to breathing difficulties"],
    arthritis: ["joint pain", "stiffness", "swelling", "decreased range of motion", "redness around joints"],
    migraine: ["throbbing headache", "sensitivity to light and sound", "nausea", "vomiting", "visual disturbances"],
    depression: ["persistent sadness", "loss of interest", "changes in appetite", "sleep problems", "difficulty concentrating", "feelings of worthlessness"],
    anxiety: ["excessive worry", "restlessness", "fatigue", "difficulty concentrating", "irritability", "muscle tension", "sleep problems"],
    heartburn: ["burning sensation in chest", "sour taste in mouth", "difficulty swallowing", "feeling of food stuck in throat"],
    bronchitis: ["persistent cough", "production of mucus", "shortness of breath", "wheezing", "low fever", "chest discomfort"],
    pneumonia: ["high fever", "chills", "cough with phlegm", "shortness of breath", "chest pain when breathing", "fatigue"],
    stroke: ["sudden numbness", "confusion", "trouble speaking", "difficulty walking", "severe headache", "paralysis on one side of body"],
    heartAttack: ["chest pain or pressure", "pain radiating to arm/back/jaw", "shortness of breath", "cold sweat", "nausea", "lightheadedness"],
    gout: ["severe joint pain", "redness and swelling", "limited range of motion", "inflammation", "lingering discomfort"],
    malaria: ["high fever", "chills", "sweating", "headache", "nausea", "vomiting", "muscle pain"],
    dengue: ["high fever", "severe headache", "pain behind the eyes", "joint and muscle pain", "rash", "mild bleeding"],
    tuberculosis: ["persistent cough", "chest pain", "coughing up blood", "fatigue", "night sweats", "weight loss", "fever"],
    thyroid: ["fatigue", "weight changes", "cold or heat sensitivity", "hair loss", "irregular heartbeat", "depression"]
  },
  treatments: {
    flu: ["rest", "fluids", "over-the-counter fever reducers", "antiviral medications if prescribed"],
    covid: ["isolation", "rest", "fluids", "monitor oxygen levels", "seek medical attention if symptoms worsen"],
    cold: ["rest", "fluids", "over-the-counter cold medications", "saline nasal spray"],
    allergies: ["antihistamines", "avoid allergens", "nasal sprays", "allergy shots for severe cases"],
    hypertension: ["blood pressure medications", "low-sodium diet", "regular exercise", "stress management"],
    diabetes: ["insulin therapy", "blood sugar monitoring", "healthy diet", "regular exercise", "oral medications", "weight management"],
    asthma: ["inhaled corticosteroids", "bronchodilators", "leukotriene modifiers", "avoiding triggers", "breathing exercises"],
    arthritis: ["pain relievers", "anti-inflammatory drugs", "physical therapy", "exercise", "hot/cold therapy", "joint protection techniques"],
    migraine: ["pain relievers", "triptans", "anti-nausea medications", "preventive medications", "stress management", "avoiding triggers"],
    depression: ["psychotherapy", "antidepressant medications", "lifestyle changes", "regular exercise", "stress reduction", "support groups"],
    anxiety: ["cognitive behavioral therapy", "anti-anxiety medications", "relaxation techniques", "stress management", "regular exercise"],
    heartburn: ["antacids", "H-2 blockers", "proton pump inhibitors", "avoiding trigger foods", "eating smaller meals", "not lying down after eating"],
    bronchitis: ["rest", "increased fluid intake", "over-the-counter pain relievers", "humidifier", "cough medicine", "antibiotics if bacterial"],
    pneumonia: ["antibiotics for bacterial pneumonia", "antiviral drugs for viral pneumonia", "fever reducers", "cough medicine", "rest", "fluids"],
    stroke: ["emergency medical care", "clot-busting drugs", "blood thinners", "surgery in some cases", "rehabilitation", "physical therapy"],
    heartAttack: ["emergency medical care", "clot-busting medications", "antiplatelet agents", "pain relievers", "surgical procedures", "cardiac rehabilitation"],
    gout: ["NSAIDs like ibuprofen or naproxen", "colchicine for acute attacks", "corticosteroids", "rest affected joint", "ice packs to reduce swelling", "allopurinol or febuxostat for prevention"],
    malaria: ["chloroquine phosphate", "artemisinin-based combination therapies", "atovaquone-proguanil", "quinine plus doxycycline", "rest", "adequate hydration", "fever management"],
    dengue: ["adequate fluid intake", "pain relievers with acetaminophen", "avoid aspirin and NSAIDs", "rest", "monitoring for warning signs", "hospital care for severe cases"],
    tuberculosis: ["multi-drug regimen for 6-9 months", "isoniazid", "rifampin", "ethambutol", "pyrazinamide", "directly observed therapy", "proper nutrition"],
    thyroid: ["hyperthyroidism: methimazole, propylthiouracil, beta blockers", "hypothyroidism: levothyroxine", "radioiodine therapy", "thyroid surgery if necessary", "regular monitoring"]
  },
  prevention: {
    flu: ["annual flu vaccine", "frequent handwashing", "avoid close contact with sick people"],
    covid: ["covid vaccination", "mask wearing in crowded places", "social distancing", "good ventilation"],
    cold: ["frequent handwashing", "avoid touching face", "avoid close contact with sick people"],
    allergies: ["identify and avoid triggers", "keep windows closed during high pollen seasons", "use air purifiers"],
    hypertension: ["regular exercise", "healthy diet", "limit alcohol", "quit smoking", "regular check-ups"],
    diabetes: ["maintain healthy weight", "regular physical activity", "balanced diet", "limit refined carbs and sugars", "regular screening if at risk"],
    asthma: ["identify and avoid triggers", "regular medication", "dust-proof home", "use air purifiers", "get flu vaccine"],
    arthritis: ["maintain healthy weight", "regular exercise", "protect joints", "good posture", "balanced diet rich in anti-inflammatory foods"],
    migraine: ["identify and avoid triggers", "regular sleep schedule", "stress management", "regular meals", "stay hydrated"],
    depression: ["regular exercise", "healthy sleep habits", "social connections", "stress management", "seeking help early"],
    anxiety: ["regular exercise", "limit caffeine and alcohol", "relaxation techniques", "adequate sleep", "support network"],
    heartburn: ["maintain healthy weight", "avoid trigger foods", "eat smaller meals", "wait before lying down", "elevate head of bed"],
    bronchitis: ["avoid smoking", "avoid air pollution", "wash hands frequently", "strengthen immunity", "vaccination"],
    pneumonia: ["pneumonia vaccination", "flu vaccination", "good hygiene", "not smoking", "managing chronic conditions"],
    stroke: ["control blood pressure", "healthy diet", "regular exercise", "not smoking", "limit alcohol", "manage diabetes"],
    heartAttack: ["healthy diet", "regular exercise", "maintain healthy weight", "not smoking", "manage stress", "regular check-ups"],
    gout: ["limit alcohol intake", "reduce purine-rich foods (red meat, seafood)", "stay well-hydrated", "maintain healthy weight", "regular exercise", "take prescribed medications consistently"],
    malaria: ["use insect repellent", "sleep under mosquito nets", "wear protective clothing", "antimalarial medications when traveling", "eliminate standing water", "use window screens"],
    dengue: ["use mosquito repellent", "wear long-sleeved clothing", "use screens on windows and doors", "remove standing water", "avoid outdoor activities during peak mosquito times"],
    tuberculosis: ["BCG vaccine", "early detection and treatment", "improved ventilation", "avoid close contact with infected individuals", "strengthening immune system"],
    thyroid: ["adequate iodine in diet", "radiation protection", "regular check-ups if family history", "screening during pregnancy", "avoid smoking"]
  },
  medications: {
    painRelievers: ["Acetaminophen (Tylenol)", "Ibuprofen (Advil, Motrin)", "Naproxen (Aleve)", "Aspirin"],
    antibiotics: ["Amoxicillin", "Azithromycin", "Ciprofloxacin", "Doxycycline", "Penicillin"],
    antihistamines: ["Cetirizine (Zyrtec)", "Loratadine (Claritin)", "Fexofenadine (Allegra)", "Diphenhydramine (Benadryl)"],
    antidepressants: ["Fluoxetine (Prozac)", "Sertraline (Zoloft)", "Escitalopram (Lexapro)", "Bupropion (Wellbutrin)"],
    bloodPressure: ["Lisinopril", "Amlodipine", "Metoprolol", "Losartan", "Hydrochlorothiazide"],
    diabetesMeds: ["Metformin", "Insulin", "Glipizide", "Sitagliptin", "Empagliflozin"],
    cholesterolMeds: ["Atorvastatin (Lipitor)", "Simvastatin (Zocor)", "Rosuvastatin (Crestor)", "Pravastatin"],
    antivirals: ["Oseltamivir (Tamiflu)", "Acyclovir", "Remdesivir", "Ribavirin", "Valacyclovir (Valtrex)"],
    antifungals: ["Fluconazole (Diflucan)", "Clotrimazole", "Terbinafine (Lamisil)", "Nystatin", "Ketoconazole"],
    bronchodilators: ["Albuterol (Ventolin)", "Ipratropium (Atrovent)", "Salmeterol (Serevent)", "Formoterol (Foradil)"],
    corticosteroids: ["Prednisone", "Budesonide (Pulmicort)", "Fluticasone (Flovent)", "Dexamethasone", "Mometasone"],
    antiConvulsants: ["Levetiracetam (Keppra)", "Carbamazepine (Tegretol)", "Lamotrigine (Lamictal)", "Valproic acid (Depakote)"],
    thyroidMeds: ["Levothyroxine (Synthroid)", "Methimazole (Tapazole)", "Propylthiouracil", "Liothyronine (Cytomel)"]
  },
  specialists: {
    cardiologist: ["heart disease", "hypertension", "arrhythmia", "heart failure", "valve disorders"],
    neurologist: ["stroke", "headaches", "seizures", "multiple sclerosis", "Parkinson's disease"],
    endocrinologist: ["diabetes", "thyroid disorders", "hormone imbalances", "osteoporosis"],
    gastroenterologist: ["digestive disorders", "liver disease", "IBS", "Crohn's disease", "ulcers"],
    rheumatologist: ["arthritis", "autoimmune diseases", "lupus", "fibromyalgia", "gout"],
    pulmonologist: ["asthma", "COPD", "pneumonia", "bronchitis", "sleep apnea"],
    dermatologist: ["skin conditions", "eczema", "psoriasis", "skin cancer", "acne"],
    psychiatrist: ["depression", "anxiety disorders", "bipolar disorder", "schizophrenia", "PTSD"]
  },
  
  // New section for home remedies
  homeRemedies: {
    cold: ["Honey and warm water for sore throat", "Steam inhalation for congestion", "Saltwater gargle for throat pain", "Chicken soup to ease symptoms", "Rest and adequate hydration"],
    flu: ["Hot herbal teas with honey and lemon", "Warm saltwater gargle", "Steam inhalation with eucalyptus oil", "Plenty of rest and fluids", "Vitamin C rich foods"],
    allergies: ["Local honey consumption", "Saline nasal irrigation", "Hot tea with local herbs", "Apple cider vinegar in water", "Essential oil diffusion (eucalyptus, peppermint)"],
    headache: ["Peppermint oil on temples", "Cold compress for tension headaches", "Warm compress for sinus headaches", "Hydration", "Ginger tea", "Resting in a dark, quiet room"],
    nausea: ["Ginger tea or candies", "Peppermint tea", "Small, bland meals", "Acupressure on wrist", "Lemon scent breathing", "Avoiding strong odors"],
    soreThroat: ["Honey in warm water or tea", "Saltwater gargle", "Chamomile tea", "Licorice root tea", "Marshmallow root tea", "Clove water gargle"],
    indigestion: ["Ginger tea", "Chamomile tea", "Apple cider vinegar in water", "Baking soda in water", "Peppermint tea", "Fennel seeds after meals"],
    insomnia: ["Warm milk with honey", "Chamomile tea", "Lavender essential oil diffusion", "Valerian root tea", "Limiting screen time before bed", "Regular sleep schedule"],
    constipation: ["Increased fiber intake", "Prune juice", "Flaxseed in water", "Increased water intake", "Regular exercise", "Warm water with lemon in the morning"],
    diarrhea: ["BRAT diet (bananas, rice, applesauce, toast)", "Probiotics like yogurt", "Plenty of clear fluids", "Chamomile tea", "Ginger", "Avoiding dairy and fatty foods"],
    arthritisPain: ["Turmeric milk", "Warm oil massage", "Epsom salt baths", "Hot and cold compresses", "Apple cider vinegar drink", "Anti-inflammatory foods"],
    stressAndAnxiety: ["Chamomile tea", "Lavender aromatherapy", "Deep breathing exercises", "Meditation", "Regular exercise", "Limiting caffeine", "Warm baths"]
  },
  
  // New section for dietary recommendations
  dietaryRecommendations: {
    hypertension: ["DASH diet", "Low sodium foods", "Potassium-rich foods (bananas, potatoes)", "Limited alcohol", "Dark chocolate in moderation", "Berries and pomegranates", "Beet juice"],
    diabetes: ["Low glycemic index foods", "High fiber foods", "Lean proteins", "Healthy fats", "Limited carbohydrates", "Regular meal timing", "Plenty of non-starchy vegetables"],
    heartDisease: ["Mediterranean diet", "Omega-3 fatty acids (fish)", "Whole grains", "Nuts and seeds", "Olive oil", "Limited red meat", "Avoiding trans fats"],
    kidneyDisease: ["Low sodium foods", "Controlled protein intake", "Potassium and phosphorus restrictions", "Limited processed foods", "Adequate hydration", "Heart-healthy foods"],
    liver: ["Limited alcohol", "Low-fat foods", "Limited added sugars", "Plenty of fruits and vegetables", "Coffee in moderation", "Avoiding raw shellfish", "Limiting fried foods"],
    gout: ["Limited purine-rich foods", "Limited red meat and seafood", "Limited alcohol", "Limited fructose", "Cherry juice", "Plenty of water", "Low-fat dairy products"],
    inflammation: ["Mediterranean diet", "Fatty fish (omega-3s)", "Nuts and seeds", "Olive oil", "Turmeric", "Green leafy vegetables", "Berries", "Limited processed foods"],
    boneHealth: ["Calcium-rich foods", "Vitamin D sources", "Magnesium-rich foods", "Vitamin K sources", "Limited salt", "Limited caffeine", "Avoiding excessive protein"]
  }
};

// Common medical questions and answers
const faqResponses = {
  "what are flu symptoms": "Common flu symptoms include fever, cough, fatigue, body aches, and sore throat. If you're experiencing these symptoms, make sure to rest and stay hydrated.",
  "how do i treat a cold": "For a cold, get plenty of rest, stay hydrated, and consider over-the-counter cold medications. A saline nasal spray can help with congestion.",
  "covid symptoms": "COVID-19 symptoms include fever, cough, shortness of breath, and loss of taste or smell. If you suspect you have COVID, please get tested and follow isolation guidelines.",
  "blood pressure high": "High blood pressure (hypertension) often has no symptoms but can cause headaches, shortness of breath, or nosebleeds in severe cases. Regular monitoring and medication as prescribed by your doctor are important.",
  "how to lower blood pressure": "To lower blood pressure: maintain a healthy weight, exercise regularly, eat a heart-healthy diet, reduce sodium, limit alcohol, quit smoking, and manage stress.",
  "diabetes management": "Diabetes management includes monitoring blood sugar, taking medications as prescribed, eating a balanced diet, regular physical activity, and attending regular check-ups.",
  "heart attack signs": "Heart attack warning signs include chest pain/pressure, pain in arms/back/neck/jaw, shortness of breath, cold sweat, nausea, and lightheadedness. Seek emergency care immediately if these occur.",
  "when to see doctor": "See a doctor if you have persistent symptoms that don't improve, high fever, severe pain, difficulty breathing, unusual bleeding, or symptoms of chronic conditions worsening.",
  "diabetes symptoms": "Common symptoms of diabetes include frequent urination, increased thirst, unexplained weight loss, fatigue, blurred vision, slow-healing sores, and frequent infections. If you're experiencing these symptoms, please consult your doctor.",
  "asthma symptoms": "Asthma symptoms include wheezing, shortness of breath, chest tightness, and coughing, especially at night or early morning. Triggers can include allergens, exercise, cold air, and respiratory infections.",
  "arthritis treatment": "Arthritis treatment options include medication for pain and inflammation, physical therapy to improve mobility, regular exercise, hot and cold therapy, and in some cases, surgery. Weight management is also important.",
  "how to prevent diabetes": "To prevent diabetes: maintain a healthy weight, be physically active, eat a balanced diet with plenty of fiber and whole grains, limit refined carbs and sugars, quit smoking, and get regular check-ups.",
  "what causes migraines": "Migraines can be triggered by stress, certain foods and drinks (like alcohol and caffeine), changes in sleep patterns, hormonal changes, strong sensory stimuli (bright lights, loud sounds), and weather changes.",
  "depression vs sadness": "While sadness is a normal emotion that passes with time, depression is persistent (lasting weeks or months), affects daily functioning, and may include feelings of worthlessness, loss of interest in activities, changes in appetite/sleep, and thoughts of death.",
  "anxiety disorder treatment": "Anxiety disorders are treated with psychotherapy (like cognitive behavioral therapy), medications (like SSRIs or benzodiazepines), stress management techniques, lifestyle changes, and support groups.",
  "heartburn remedies": "For heartburn relief: avoid trigger foods, eat smaller meals, don't lie down after eating, elevate your head when sleeping, maintain a healthy weight, and try over-the-counter antacids. If frequent, consult a doctor.",
  "stroke prevention": "Prevent stroke by controlling blood pressure, not smoking, limiting alcohol, eating a healthy diet, exercising regularly, maintaining a healthy weight, managing diabetes, and taking medications as prescribed.",
  "vaccination schedule adults": "Adult vaccinations include annual flu shot, Td/Tdap (tetanus, diphtheria, pertussis) every 10 years, shingles vaccine after age 50, pneumococcal vaccines for adults over 65, and COVID-19 vaccines as recommended.",
  "common medication side effects": "Common medication side effects include nausea, dizziness, fatigue, headache, rash, dry mouth, digestive issues, and changes in appetite. Always report unusual or severe side effects to your doctor.",
  "how to read nutrition labels": "When reading nutrition labels, check serving sizes first, then calories per serving, limit saturated and trans fats, sodium, and added sugars, and look for foods high in fiber, vitamins, and minerals.",
  "telemedicine benefits": "Telemedicine benefits include convenient access to care, reduced travel time, decreased exposure to other illnesses, often shorter wait times, and the ability to receive care from the comfort of home.",
  "annual check up importance": "Annual check-ups are important for preventive care, early detection of health issues, updating vaccinations, reviewing medications, and developing a relationship with your healthcare provider.",
  
  // New FAQ entries for disease remedies and treatments
  "hypertension medicines": "Common medications for hypertension include ACE inhibitors (like Lisinopril), ARBs (like Losartan), calcium channel blockers (like Amlodipine), diuretics (like Hydrochlorothiazide), and beta-blockers (like Metoprolol). Always take as prescribed and have regular check-ups.",
  "diabetes medications": "Diabetes medications include Metformin (first-line therapy for type 2), sulfonylureas (like Glipizide), DPP-4 inhibitors (like Sitagliptin), SGLT2 inhibitors (like Empagliflozin), GLP-1 receptor agonists, and insulin therapy. Your doctor will determine the best treatment plan for you.",
  "asthma medications": "Asthma is managed with controller medications (like inhaled corticosteroids), quick-relief medications (like albuterol), and biologics for severe cases. Proper inhaler technique is crucial for effective treatment.",
  "malaria treatment": "Malaria is treated with antimalarial medications like chloroquine, artemisinin-based combinations, atovaquone-proguanil, or quinine plus doxycycline. The specific medication depends on the malaria type and region. Early treatment is essential.",
  "tuberculosis treatment": "TB requires a multi-drug regimen taken for 6-9 months, including isoniazid, rifampin, ethambutol, and pyrazinamide. Strict adherence to the full course is critical to prevent drug resistance.",
  "heart failure medications": "Heart failure medications include ACE inhibitors, beta-blockers, diuretics, aldosterone antagonists, and SGLT2 inhibitors. These help improve heart function, reduce symptoms, and extend life expectancy.",
  "migraine medicine": "Migraine treatments include pain relievers (acetaminophen, NSAIDs), triptans (like Sumatriptan), anti-nausea medications, and preventive medications (beta-blockers, antidepressants, anti-seizure drugs, CGRP inhibitors).",
  "arthritis medications": "Arthritis medications include NSAIDs (like ibuprofen), corticosteroids, DMARDs (like methotrexate), biologics (like TNF inhibitors), and JAK inhibitors. Treatment varies based on arthritis type and severity.",
  "natural remedies for cold": "Natural cold remedies include honey and lemon in warm water, saline nasal irrigation, steam inhalation, vitamin C rich foods, zinc lozenges, and plenty of rest and fluids. These may help ease symptoms and support recovery.",
  "home remedies for fever": "Home management for fever includes staying hydrated, resting, taking lukewarm baths, using lightweight clothing and bedding, and over-the-counter fever reducers like acetaminophen or ibuprofen when appropriate.",
  "diet for hypertension": "The DASH diet is recommended for hypertension: rich in fruits, vegetables, whole grains, and low-fat dairy, with limited sodium, saturated fats, and added sugars. Potassium-rich foods like bananas and potatoes are beneficial.",
  "foods for diabetes": "A diabetes-friendly diet includes high-fiber foods (vegetables, whole grains, legumes), lean proteins, healthy fats, and limited refined carbs and sugars. Consistent meal timing and portion control are important.",
  "supplements for joint pain": "Supplements that may help with joint pain include glucosamine, chondroitin, omega-3 fatty acids, turmeric/curcumin, and vitamin D. Consult your doctor before starting supplements, especially if you take other medications."
};

// Role-specific responses
const roleBasedResponses = {
  patient: {
    "appointment": "You can book an appointment through the 'Take Appointment' section. Select your preferred date and time, describe your symptoms, and submit the form.",
    "prescription": "Your prescriptions can be viewed in the Profile tab. Each prescription includes medication details and instructions from your doctor.",
    "payment": "To make a payment, go to your appointment details and click on the 'Make Payment' button. We accept credit/debit cards and insurance.",
    "profile": "Your profile contains your personal information, medical history, and appointment records. You can update your information in the Profile tab.",
    "medical history": "Your medical history is stored securely in your profile and is shared only with healthcare providers involved in your care. You can view and update certain parts of your history.",
    "test results": "Your test results will be available in the 'Reports' section of your dashboard once they are reviewed by your doctor. You'll receive a notification when new results are available.",
    "insurance": "To update your insurance information, go to your Profile tab and select 'Insurance Details'. Enter your new policy information and save the changes.",
    "referral": "If you need a referral to a specialist, please message your primary care doctor through the messaging system or discuss it during your next appointment.",
    "emergency care": "For medical emergencies, please call 911 or go to the nearest emergency room immediately. Do not wait for an online appointment.",
    "medication refill": "For medication refills, go to the Prescriptions section in your Profile tab, find the medication you need refilled, and click the 'Request Refill' button.",
    "cancel appointment": "To cancel an appointment, go to the Appointments section, find the appointment you wish to cancel, and click the 'Cancel' button. Please give at least 24 hours notice."
  },
  doctor: {
    "appointment": "You can view and manage your appointments in the Appointment Management section. You can accept, decline, or mark appointments as completed.",
    "prescription": "To write a prescription, find the patient's appointment and click on 'Write Prescription'. Enter the medication details and submit the form.",
    "patient history": "Patient history is available when you view their appointment details. This includes past conditions, medications, and previous visits.",
    "schedule": "Your schedule shows all upcoming appointments. You can manage your availability through the calendar interface.",
    "referral": "To refer a patient to a specialist, select the patient's record, click on 'Create Referral', choose the specialty, and add any relevant notes about the patient's condition.",
    "lab orders": "To order laboratory tests, select the patient's appointment, click 'Order Tests', select the required tests from the menu, and provide any specific instructions.",
    "medical coding": "For assistance with medical coding, you can use the 'Coding Assistant' tool in the dashboard. Enter symptoms or diagnoses to get suggested ICD-10 codes.",
    "clinical guidelines": "Access clinical guidelines through the Resources section in your dashboard. Guidelines are regularly updated according to the latest medical research.",
    "patient education": "Patient education materials can be found in the Resources section. You can send these directly to patients through the messaging system.",
    "telemedicine": "To start a telemedicine appointment, go to the Appointments section, find the scheduled telemedicine appointment, and click 'Start Session' at the appointed time.",
    "documentation": "Complete visit documentation by accessing the patient's appointment, clicking 'Document Visit', and filling in the required fields for symptoms, examination, diagnosis, and treatment plan."
  }
};

/**
 * Generate a response based on user input and role
 * @param {string} message - User's message
 * @param {string} role - User role (patient or doctor)
 * @param {Object} context - Additional context information
 * @returns {Object} Response object with text and suggestions
 */
function generateResponse(message, role = 'user', context = {}) {
  const lowerMessage = message.toLowerCase();
  let response = "";
  let suggestions = [];

  // Check for exact matches in FAQ
  for (const [question, answer] of Object.entries(faqResponses)) {
    if (lowerMessage.includes(question)) {
      response = answer;
      suggestions = getSuggestionsForTopic(question);
      return { response, suggestions };
    }
  }

  // Check for role-specific queries
  if (role && roleBasedResponses[role]) {
    for (const [topic, answer] of Object.entries(roleBasedResponses[role])) {
      if (lowerMessage.includes(topic)) {
        response = answer;
        suggestions = getRoleSpecificSuggestions(role);
        return { response, suggestions };
      }
    }
  }

  // Check for disease-specific queries
  const diseaseNames = Object.keys(medicalKnowledgeBase.symptoms);
  for (const disease of diseaseNames) {
    if (lowerMessage.includes(disease.toLowerCase())) {
      // Check if query is about symptoms
      if (lowerMessage.includes("symptom") || lowerMessage.includes("sign")) {
        response = `Common symptoms of ${disease} include: ${medicalKnowledgeBase.symptoms[disease].join(", ")}.`;
        suggestions = [`${disease} treatment`, `${disease} prevention`, `${disease} medicines`];
        return { response, suggestions };
      }
      
      // Check if query is about treatments
      if (lowerMessage.includes("treat") || lowerMessage.includes("cure") || lowerMessage.includes("manag")) {
        response = `Treatment options for ${disease} include: ${medicalKnowledgeBase.treatments[disease].join(", ")}.`;
        suggestions = [`${disease} symptoms`, `${disease} prevention`, `Medicines for ${disease}`];
        return { response, suggestions };
      }
      
      // Check if query is about prevention
      if (lowerMessage.includes("prevent") || lowerMessage.includes("avoid")) {
        response = `Prevention measures for ${disease} include: ${medicalKnowledgeBase.prevention[disease].join(", ")}.`;
        suggestions = [`${disease} symptoms`, `${disease} treatment`, `Risk factors for ${disease}`];
        return { response, suggestions };
      }
      
      // Check if query is about medicines/remedies
      if (lowerMessage.includes("medicine") || lowerMessage.includes("medication") || lowerMessage.includes("drug") || lowerMessage.includes("remedy")) {
        let medicationResponse = `Common medications used for ${disease} include: ${medicalKnowledgeBase.treatments[disease].join(", ")}. `;
        
        // Add home remedies if available
        const diseaseKey = Object.keys(medicalKnowledgeBase.homeRemedies).find(key => 
          key.toLowerCase() === disease.toLowerCase() || 
          disease.toLowerCase().includes(key.toLowerCase())
        );
        
        if (diseaseKey) {
          medicationResponse += `Some home remedies that might help include: ${medicalKnowledgeBase.homeRemedies[diseaseKey].join(", ")}.`;
        }
        
        medicationResponse += " Always consult with your healthcare provider before starting any new medication or treatment.";
        
        response = medicationResponse;
        suggestions = [`${disease} symptoms`, `${disease} prevention`, `Diet for ${disease}`];
        return { response, suggestions };
      }
      
      // General disease query - provide comprehensive information
      response = `${disease.charAt(0).toUpperCase() + disease.slice(1)} information:\n\n`;
      response += `• Symptoms: ${medicalKnowledgeBase.symptoms[disease].join(", ")}\n\n`;
      response += `• Treatment options: ${medicalKnowledgeBase.treatments[disease].join(", ")}\n\n`;
      response += `• Prevention measures: ${medicalKnowledgeBase.prevention[disease].join(", ")}\n\n`;
      response += "Always consult with a healthcare professional for personalized medical advice.";
      
      suggestions = [`${disease} medications`, `${disease} home remedies`, `Diet for ${disease}`];
      return { response, suggestions };
    }
  }

  // Check for home remedy queries
  if (lowerMessage.includes("home remedy") || lowerMessage.includes("natural") || lowerMessage.includes("home treatment")) {
    for (const [condition, remedies] of Object.entries(medicalKnowledgeBase.homeRemedies)) {
      if (lowerMessage.includes(condition.toLowerCase())) {
        response = `Home remedies for ${condition} include: ${remedies.join(", ")}. Remember that these remedies may help with symptom relief but are not replacements for medical treatment when needed.`;
        suggestions = [`${condition} medications`, `When to see doctor for ${condition}`, `Prevention of ${condition}`];
        return { response, suggestions };
      }
    }
  }

  // Check for dietary recommendation queries
  if (lowerMessage.includes("diet") || lowerMessage.includes("food") || lowerMessage.includes("eat")) {
    for (const [condition, recommendations] of Object.entries(medicalKnowledgeBase.dietaryRecommendations)) {
      if (lowerMessage.includes(condition.toLowerCase())) {
        response = `Dietary recommendations for ${condition} include: ${recommendations.join(", ")}. It's important to consult with a healthcare provider or dietitian for personalized nutrition advice.`;
        suggestions = [`${condition} treatment`, `${condition} symptoms`, `Supplements for ${condition}`];
        return { response, suggestions };
      }
    }
  }

  // Check for medications
  if (lowerMessage.includes("medicine") || lowerMessage.includes("drug") || lowerMessage.includes("medication")) {
    for (const [category, medicationList] of Object.entries(medicalKnowledgeBase.medications)) {
      if (lowerMessage.includes(category.toLowerCase())) {
        response = `Common ${category} include: ${medicationList.join(", ")}. Always consult with your doctor before starting any medication.`;
        suggestions = ["Medication side effects", "When to take medications", "Drug interactions"];
        return { response, suggestions };
      }
    }
  }

  // Check for specialist information
  if (lowerMessage.includes("specialist") || lowerMessage.includes("doctor type")) {
    for (const [specialist, conditionsList] of Object.entries(medicalKnowledgeBase.specialists)) {
      if (lowerMessage.includes(specialist)) {
        response = `A ${specialist} treats conditions such as: ${conditionsList.join(", ")}.`;
        suggestions = ["How to find a specialist", "When to see a specialist", "Specialist referral"];
        return { response, suggestions };
      }
    }
  }

  // Default responses based on role
  if (role === 'patient') {
    response = "I'm here to help with your healthcare needs. You can ask about symptoms, treatments, medications, home remedies, or dietary recommendations for various conditions.";
    suggestions = ["Common cold remedies", "Hypertension management", "Diet for diabetes", "Arthritis medications"];
  } else if (role === 'doctor') {
    response = "I'm here to assist with your practice. You can ask about patient management, treatments, or specific condition information.";
    suggestions = ["Medication options", "Treatment guidelines", "Patient education resources"];
  } else {
    response = "I'm your healthcare assistant. I can provide information about symptoms, treatments, medications, home remedies, and dietary recommendations for various health conditions.";
    suggestions = ["Common symptoms", "Home remedies", "When to see a doctor", "Preventive healthcare"];
  }

  return { response, suggestions };
}

/**
 * Get suggestions based on the topic
 * @param {string} topic - The topic to get suggestions for
 * @returns {Array} List of suggested queries
 */
function getSuggestionsForTopic(topic) {
  const suggestionMap = {
    "flu": ["How to treat flu", "Flu prevention", "When to see a doctor for flu"],
    "cold": ["Cold vs flu", "Cold remedies", "How long does a cold last"],
    "covid": ["COVID testing", "Long COVID symptoms", "COVID isolation guidelines"],
    "blood pressure": ["How to lower blood pressure", "Blood pressure medications", "Hypertension diet"],
    "symptoms": ["Common disease symptoms", "When symptoms are serious", "Tracking symptoms"],
    "treatment": ["Home remedies", "When to seek treatment", "Medication side effects"],
    "doctor": ["Finding a specialist", "Preparing for doctor visit", "Telemedicine options"],
    "diabetes": ["Diabetes management", "Diabetes diet", "Blood sugar monitoring", "Diabetes complications"],
    "asthma": ["Asthma triggers", "Inhaler techniques", "Exercise with asthma", "Asthma action plan"],
    "arthritis": ["Arthritis pain management", "Exercise for arthritis", "Joint protection", "Arthritis types"],
    "migraine": ["Migraine triggers", "Migraine prevention", "When to see doctor for headaches", "Migraine medications"],
    "depression": ["Depression treatment", "Depression vs sadness", "Supporting someone with depression", "Self-care for depression"],
    "anxiety": ["Managing anxiety attacks", "Anxiety coping strategies", "Anxiety vs normal worry", "When to seek help for anxiety"],
    "nutrition": ["Balanced diet basics", "Reading nutrition labels", "Healthy meal planning", "Nutritional supplements"],
    "exercise": ["Exercise recommendations", "Starting a fitness routine", "Exercise benefits", "Low-impact workout options"],
    "medication": ["Understanding prescriptions", "Medication adherence", "Managing side effects", "Questions to ask about new medications"]
  };

  // Find the most relevant topic
  for (const [key, suggestions] of Object.entries(suggestionMap)) {
    if (topic.includes(key)) {
      return suggestions;
    }
  }

  // Default suggestions
  return ["Common symptoms", "Preventive care", "When to see a doctor"];
}

/**
 * Get role-specific suggestions
 * @param {string} role - User role (patient or doctor)
 * @returns {Array} List of suggested queries
 */
function getRoleSpecificSuggestions(role) {
  if (role === 'patient') {
    return ["Book an appointment", "View my prescriptions", "Update my profile", "Check my test results", "Request medication refill"];
  } else if (role === 'doctor') {
    return ["Manage appointments", "Write a prescription", "View patient history", "Order lab tests", "Create referral"];
  }
  return ["Healthcare information", "Medical advice", "Using the platform"];
}

module.exports = {
  generateResponse,
  medicalKnowledgeBase,
  faqResponses,
  roleBasedResponses
}; 