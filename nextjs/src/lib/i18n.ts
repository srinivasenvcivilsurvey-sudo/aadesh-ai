// Aadesh AI — Kannada + English UI strings
// All user-facing text lives here for easy translation

export type Locale = 'kn' | 'en';

const strings = {
  // --- Branding ---
  productName: { kn: 'ಆದೇಶ AI', en: 'Aadesh AI' },
  tagline: { kn: 'ಕರ್ನಾಟಕ ಭೂದಾಖಲೆ ಕಚೇರಿಗಳಿಗೆ AI ಆದೇಶ ಕರಡು', en: 'AI Order Drafting for Karnataka Land Record Offices' },

  // --- Nav / Layout ---
  nav: {
    dashboard: { kn: 'ಡ್ಯಾಶ್\u200Cಬೋರ್ಡ್', en: 'Dashboard' },
    trainAI: { kn: 'AI ತರಬೇತಿ', en: 'Train AI' },
    generateOrder: { kn: 'ಆದೇಶ ರಚಿಸಿ', en: 'Generate Order' },
    myOrders: { kn: 'ನನ್ನ ಆದೇಶಗಳು', en: 'My Orders' },
    uploadOrders: { kn: 'ಆದೇಶಗಳನ್ನು ಅಪ್\u200Cಲೋಡ್ ಮಾಡಿ', en: 'Upload Orders' },
    myFiles: { kn: 'ನನ್ನ ಫೈಲ್\u200Cಗಳು', en: 'My Files' },
    settings: { kn: 'ಸೆಟ್ಟಿಂಗ್\u200Cಗಳು', en: 'Settings' },
    billing: { kn: 'ಕ್ರೆಡಿಟ್ ಖರೀದಿ', en: 'Buy Credits' },
    signOut: { kn: 'ಲಾಗ್ ಔಟ್', en: 'Logout' },
    changePassword: { kn: 'ಪಾಸ್\u200Cವರ್ಡ್ ಬದಲಿಸಿ', en: 'Change Password' },
    signedInAs: { kn: 'ಇವರಾಗಿ ಲಾಗಿನ್:', en: 'Signed in as' },
  },

  // --- Landing Page ---
  landing: {
    hero: { kn: 'ಸರ್ಕಾರಿ ಆದೇಶಗಳನ್ನು ನಿಮಿಷಗಳಲ್ಲಿ ರಚಿಸಿ', en: 'Draft Government Orders in Minutes' },
    heroSub: { kn: 'ಸರಕಾರಿ ಕನ್ನಡದಲ್ಲಿ AI-ಚಾಲಿತ ಆದೇಶ ಕರಡು. ವೇಗವಾಗಿ, ನಿಖರವಾಗಿ, ಕಡಿಮೆ ವೆಚ್ಚದಲ್ಲಿ.', en: 'AI-powered order drafting in Sarakari Kannada. Faster, accurate, affordable.' },
    heroTitle: { kn: 'ನಿಮ್ಮ ಆದೇಶಗಳನ್ನು AI ಯೊಂದಿಗೆ ರಚಿಸಿ', en: 'Generate Government Orders with AI' },
    heroSubtitle: { kn: 'ಅಪ್ಲೋಡ್ ಮಾಡಿ. ತರಬೇತಿ ನೀಡಿ. ರಚಿಸಿ.', en: 'Upload. Train. Generate.' },
    getStarted: { kn: 'ಈಗ ಪ್ರಾರಂಭಿಸಿ', en: 'Get Started' },
    login: { kn: 'ಲಾಗಿನ್', en: 'Login' },
    signUp: { kn: 'ಸೈನ್ ಅಪ್', en: 'Sign Up' },
    features: { kn: 'ವೈಶಿಷ್ಟ್ಯಗಳು', en: 'Features' },
    pricing: { kn: 'ಬೆಲೆ ಪಟ್ಟಿ', en: 'Pricing' },
    howItWorks: { kn: 'ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ', en: 'How It Works' },
    madeInBengaluru: { kn: 'ಬೆಂಗಳೂರಿನಲ್ಲಿ ನಿರ್ಮಿಸಲಾಗಿದೆ', en: 'Made in Bengaluru' },
    qualityScore: { kn: '90/100 ಗುಣಮಟ್ಟ ಸ್ಕೋರ್', en: '90/100 Quality Score' },
    trainedOn: { kn: '576+ ಆದೇಶಗಳಿಂದ ತರಬೇತಿ', en: 'Trained on 576+ orders' },
    dataInIndia: { kn: 'ಭಾರತದಲ್ಲಿ ಡೇಟಾ ಶೇಖರಣೆ', en: 'Data stored in India' },
    poweredBySarvam: { kn: 'Sarvam AI ಮೂಲಕ ಸಂಚಾಲಿತ', en: 'Powered by Sarvam AI' },
  },

  // --- How It Works (3-step onboarding) ---
  howItWorks: {
    step1Title: { kn: 'ಆದೇಶಗಳನ್ನು ಅಪ್ಲೋಡ್ ಮಾಡಿ', en: 'Upload Your Orders' },
    step1Desc: { kn: 'ನಿಮ್ಮ ಅಂತಿಮ ಆದೇಶಗಳನ್ನು ಅಪ್ಲೋಡ್ ಮಾಡಿ', en: 'Upload your best finalized orders' },
    step2Title: { kn: 'AI ನಿಮ್ಮ ಶೈಲಿ ಕಲಿಯುತ್ತದೆ', en: 'AI Learns Your Style' },
    step2Desc: { kn: 'AI ನಿಮ್ಮ ಬರವಣಿಗೆ ಶೈಲಿಯನ್ನು ವಿಶ್ಲೇಷಿಸುತ್ತದೆ', en: 'AI analyzes your writing style' },
    step3Title: { kn: 'ಸೆಕೆಂಡುಗಳಲ್ಲಿ ಹೊಸ ಆದೇಶ', en: 'New Order in Seconds' },
    step3Desc: { kn: 'ಹೊಸ ಪ್ರಕರಣಕ್ಕೆ ಕರಡು ತಕ್ಷಣ ಸಿದ್ಧ', en: 'Draft ready instantly for new cases' },
  },

  // --- Features ---
  features: {
    aiDrafting: { kn: 'AI ಆದೇಶ ಕರಡು', en: 'AI Order Drafting' },
    aiDraftingDesc: { kn: 'ಸರಕಾರಿ ಕನ್ನಡದಲ್ಲಿ 13-ವಿಭಾಗ ಆದೇಶಗಳನ್ನು ಸ್ವಯಂ ರಚಿಸಿ', en: 'Auto-generate 13-section orders in Sarakari Kannada' },
    secureStorage: { kn: 'ಸುರಕ್ಷಿತ ಸಂಗ್ರಹ', en: 'Secure Storage' },
    secureStorageDesc: { kn: 'ನಿಮ್ಮ ಆದೇಶಗಳು ಮತ್ತು ಡಾಕ್ಯುಮೆಂಟ್\u200Cಗಳು ಸುರಕ್ಷಿತ', en: 'Your orders and documents are protected' },
    kannadaFirst: { kn: 'ಕನ್ನಡ ಮೊದಲು', en: 'Kannada First' },
    kannadaFirstDesc: { kn: 'ಸರಕಾರಿ ಕನ್ನಡ ಪರಿಭಾಷೆ ಮತ್ತು ಶೈಲಿ', en: 'Sarakari Kannada terminology and style' },
    docxPdf: { kn: 'DOCX & PDF', en: 'DOCX & PDF' },
    docxPdfDesc: { kn: 'ಪ್ರೊಫೆಷನಲ್ ಫಾರ್ಮ್ಯಾಟ್\u200Cನಲ್ಲಿ ಡೌನ್\u200Cಲೋಡ್ ಮಾಡಿ', en: 'Download in professional format' },
  },

  // --- Pricing (Recharge Packs) ---
  pricing: {
    packA: { kn: 'ಪ್ಯಾಕ್ A', en: 'Pack A' },
    packB: { kn: 'ಪ್ಯಾಕ್ B', en: 'Pack B' },
    packC: { kn: 'ಪ್ಯಾಕ್ C', en: 'Pack C' },
    packD: { kn: 'ಪ್ಯಾಕ್ D', en: 'Pack D' },
    orders: { kn: 'ಆದೇಶಗಳು', en: 'orders' },
    perOrder: { kn: 'ಪ್ರತಿ ಆದೇಶ', en: 'per order' },
    buyNow: { kn: 'ಈಗ ಖರೀದಿಸಿ', en: 'Buy Now' },
    bestValue: { kn: 'ಅತ್ಯುತ್ತಮ ಮೌಲ್ಯ', en: 'Best Value' },
  },

  // --- Order Generation ---
  generate: {
    title: { kn: 'ಹೊಸ ಆದೇಶ ರಚಿಸಿ', en: 'Generate New Order' },
    orderType: { kn: 'ಆದೇಶ ಪ್ರಕಾರ', en: 'Order Type' },
    appeal: { kn: 'ಮೇಲ್ಮನವಿ (ಅಪೀಲ್)', en: 'Appeal' },
    suoMotu: { kn: 'ಸ್ವಯಂಪ್ರೇರಿತ (ಸುಮೋಟೋ)', en: 'Suo Motu' },
    dismissed: { kn: 'ವಜಾ', en: 'Dismissed' },
    review: { kn: 'ಪುನರ್ವಿಮರ್ಶೆ', en: 'Review' },
    other: { kn: 'ಇತರೆ', en: 'Other' },
    caseDetails: { kn: 'ಪ್ರಕರಣ ವಿವರಗಳು', en: 'Case Details' },
    caseDetailsPlaceholder: { kn: 'ಉದಾ:\nಮೇಲ್ಮನವಿ ಸಂಖ್ಯೆ: 123/2024-25\nಮೇಲ್ಮನವಿದಾರರು: [ಹೆಸರು]\nಎದುರುದಾರರು: [ಹೆಸರು]\nಸರ್ವೆ ನಂ: 45/2, ಗ್ರಾಮ: [ಹೆಸರು]\nವಿಷಯ: ಪಹಣಿಯಲ್ಲಿ ಹೆಸರು ತಿದ್ದುಪಡಿ\nಪ್ರಕರಣದ ವಿವರಗಳನ್ನು ಇಲ್ಲಿ ನಮೂದಿಸಿ...', en: 'Example:\nAppeal No: 123/2024-25\nAppellant: [Name]\nRespondent: [Name]\nSurvey No: 45/2, Village: [Name]\nSubject: Correction in RTC\nEnter full case details here...' },
    generateBtn: { kn: 'ಆದೇಶ ರಚಿಸಿ', en: 'Generate Order' },
    generating: { kn: 'ರಚಿಸಲಾಗುತ್ತಿದೆ...', en: 'Generating...' },
    creditsRemaining: { kn: 'ಉಳಿದ ಕ್ರೆಡಿಟ್\u200Cಗಳು', en: 'Credits remaining' },
    noCredits: { kn: 'ಸಾಕಷ್ಟು ಕ್ರೆಡಿಟ್\u200Cಗಳಿಲ್ಲ. ದಯವಿಟ್ಟು ರೀಚಾರ್ಜ್ ಮಾಡಿ.', en: 'Insufficient credits. Please recharge.' },
    uploadCase: { kn: 'ಪ್ರಕರಣ ಫೈಲ್ ಅಪ್\u200Cಲೋಡ್ ಮಾಡಿ', en: 'Upload Case File' },
    acceptedFormats: { kn: '.docx ಅಥವಾ .pdf ಫೈಲ್ ಮಾತ್ರ', en: '.docx or .pdf files only' },
    selectOrderType: { kn: 'ಆದೇಶ ಪ್ರಕಾರ ಆಯ್ಕೆಮಾಡಿ', en: 'Select order type' },
    enterDetails: { kn: 'ಪ್ರಕರಣದ ವಿವರಗಳನ್ನು ನಮೂದಿಸಿ', en: 'Enter case details' },
    refsUsed: { kn: 'ಉಲ್ಲೇಖ ಆದೇಶಗಳನ್ನು ಬಳಸಲಾಗಿದೆ', en: 'reference orders used' },
  },

  // --- Order Result / Download ---
  result: {
    orderGenerated: { kn: 'ಆದೇಶ ರಚಿಸಲಾಗಿದೆ', en: 'Order Generated' },
    downloadDocx: { kn: 'DOCX ಡೌನ್\u200Cಲೋಡ್', en: 'Download DOCX' },
    downloadPdf: { kn: 'PDF ಡೌನ್\u200Cಲೋಡ್', en: 'Download PDF' },
    verifyCheckbox: { kn: 'ನಾನು ಈ ಆದೇಶವನ್ನು ಪರಿಶೀಲಿಸಿದ್ದೇನೆ ಮತ್ತು ಇದರ ವಿಷಯಕ್ಕೆ ಜವಾಬ್ದಾರನಾಗಿದ್ದೇನೆ', en: 'I have verified this order and take responsibility for its content' },
    mustVerify: { kn: 'ಡೌನ್\u200Cಲೋಡ್ ಮಾಡಲು ಮೊದಲು ಪರಿಶೀಲಿಸಿ', en: 'Please verify before downloading' },
    regenerate: { kn: 'ಮರುರಚಿಸಿ', en: 'Regenerate' },
    wordCount: { kn: 'ಪದ ಸಂಖ್ಯೆ', en: 'Word count' },
    sections: { kn: 'ವಿಭಾಗಗಳು', en: 'Sections' },
    qualityScore: { kn: 'ಗುಣಮಟ್ಟ ಸ್ಕೋರ್', en: 'Quality Score' },
    aiDisclaimer: { kn: 'AI-ಸಹಾಯಿತ ಕರಡು — ಅಧಿಕಾರಿ ಪರಿಶೀಲನೆ ಕಡ್ಡಾಯ', en: 'AI-assisted draft — Officer verification mandatory' },
    autoSaved: { kn: 'ಸ್ವಯಂ-ಉಳಿಸಲಾಗಿದೆ', en: 'Auto-saved' },
  },

  // --- Upload (Training Orders) ---
  upload: {
    title: { kn: 'ನಿಮ್ಮ ಆದೇಶಗಳನ್ನು ಅಪ್\u200Cಲೋಡ್ ಮಾಡಿ', en: 'Upload Your Orders' },
    description: { kn: 'AI ನಿಮ್ಮ ಶೈಲಿಯನ್ನು ಕಲಿಯಲು ನಿಮ್ಮ ಅಂತಿಮ ಆದೇಶಗಳನ್ನು ಅಪ್\u200Cಲೋಡ್ ಮಾಡಿ', en: 'Upload your finalized orders so AI can learn your style' },
    dragDrop: { kn: 'ಫೈಲ್ ಇಲ್ಲಿ ಎಳೆದು ಬಿಡಿ ಅಥವಾ ಕ್ಲಿಕ್ ಮಾಡಿ', en: 'Drag and drop files here or click to select' },
    dropHere: { kn: 'ಫೈಲ್ ಇಲ್ಲಿ ಬಿಡಿ', en: 'Drop files here' },
    acceptedFormatsLong: { kn: '.docx, .pdf, .jpg, .png ಫೈಲ್\u200Cಗಳು (ಗರಿಷ್ಠ 10MB)', en: '.docx, .pdf, .jpg, .png files (max 10MB)' },
    uploading: { kn: 'ಅಪ್\u200Cಲೋಡ್ ಆಗುತ್ತಿದೆ...', en: 'Uploading...' },
    uploadSuccess: { kn: 'ಫೈಲ್ ಯಶಸ್ವಿಯಾಗಿ ಅಪ್\u200Cಲೋಡ್ ಆಯಿತು', en: 'File uploaded successfully' },
    uploadFailed: { kn: 'ಅಪ್\u200Cಲೋಡ್ ವಿಫಲವಾಯಿತು', en: 'Upload failed' },
    noFiles: { kn: 'ಯಾವುದೇ ಫೈಲ್ ಅಪ್\u200Cಲೋಡ್ ಆಗಿಲ್ಲ', en: 'No files uploaded yet' },
    filesUploaded: { kn: 'ಫೈಲ್\u200Cಗಳು ಅಪ್\u200Cಲೋಡ್ ಆಗಿವೆ', en: 'files uploaded' },
    maxReached: { kn: 'ಗರಿಷ್ಠ ಮಿತಿ ತಲುಪಿದೆ (50)', en: 'Maximum limit reached (50)' },
    tooSmall: { kn: 'ಈ ಫೈಲ್ ತುಂಬಾ ಚಿಕ್ಕದಾಗಿದೆ', en: 'This file is too small' },
    noKannada: { kn: 'ಕನ್ನಡ ಪಠ್ಯ ಕಂಡುಬಂದಿಲ್ಲ', en: 'No Kannada text found' },
    duplicate: { kn: 'ಈ ಫೈಲ್ ಈಗಾಗಲೇ ಅಪ್\u200Cಲೋಡ್ ಆಗಿದೆ', en: 'This file is already uploaded' },
  },

  // --- Training ---
  training: {
    title: { kn: 'AI ತರಬೇತಿ', en: 'Train AI' },
    subtitle: { kn: 'ನಿಮ್ಮ ಉತ್ತಮ ಅಂತಿಮ ಆದೇಶಗಳನ್ನು ಅಪ್ಲೋಡ್ ಮಾಡಿ — AI ನಿಮ್ಮ ಬರವಣಿಗೆ ಶೈಲಿಯನ್ನು ಕಲಿಯುತ್ತದೆ', en: 'Upload your best finalized orders — AI will learn your writing style' },
    statusTitle: { kn: 'AI ತರಬೇತಿ ಸ್ಥಿತಿ', en: 'AI Training Status' },
    needMore: { kn: 'ಇನ್ನೂ ಆದೇಶಗಳನ್ನು ಅಪ್\u200Cಲೋಡ್ ಮಾಡಿ', en: 'Upload more orders' },
    needMoreMin: { kn: 'ಇನ್ನೂ ಆದೇಶಗಳನ್ನು ಅಪ್\u200Cಲೋಡ್ ಮಾಡಿ (ಕನಿಷ್ಠ 5)', en: 'Upload more orders (minimum 5)' },
    basicTraining: { kn: 'ಮೂಲ ತರಬೇತಿ — ಗುಣಮಟ್ಟ ಬದಲಾಗಬಹುದು', en: 'Basic training — quality may vary' },
    goodTraining: { kn: 'ಉತ್ತಮ ತರಬೇತಿ', en: 'Good training' },
    expertTraining: { kn: 'ಶ್ರೇಷ್ಠ ತರಬೇತಿ', en: 'Expert training' },
    aiReady: { kn: 'AI ಸಿದ್ಧವಾಗಿದೆ!', en: 'AI is Ready!' },
    cannotGenerate: { kn: 'ಆದೇಶ ರಚಿಸಲು ಕನಿಷ್ಠ 5 ಫೈಲ್\u200Cಗಳು ಬೇಕು', en: 'Minimum 5 files needed to generate orders' },
    trainFirst: { kn: 'ಮೊದಲು AI ಗೆ ತರಬೇತಿ ನೀಡಿ', en: 'Train AI first' },
    uploadedOrders: { kn: 'ಅಪ್\u200Cಲೋಡ್ ಮಾಡಿದ ಆದೇಶಗಳು', en: 'Uploaded Orders' },
    fileReceived: { kn: 'ಫೈಲ್ ಸ್ವೀಕರಿಸಲಾಗಿದೆ', en: 'File received' },
    textExtracted: { kn: 'ಪಠ್ಯ ಹೊರತೆಗೆಯಲಾಗಿದೆ', en: 'Text extracted' },
    typeDetected: { kn: 'ಪ್ರಕಾರ ಗುರುತಿಸಲಾಗಿದೆ', en: 'Type detected' },
    stored: { kn: 'ಉಲ್ಲೇಖವಾಗಿ ಸಂಗ್ರಹಿಸಲಾಗಿದೆ', en: 'Stored as reference' },
    processing: { kn: 'ಸಂಸ್ಕರಿಸಲಾಗುತ್ತಿದೆ...', en: 'Processing...' },
    nudiConverted: { kn: 'Nudi ಸ್ವಯಂ-ಪರಿವರ್ತನೆ', en: 'Nudi auto-converted' },
    orderTypeBreakdown: { kn: 'ಆದೇಶ ಪ್ರಕಾರದ ವಿವರ', en: 'Order type breakdown' },
    goToGenerate: { kn: 'ಆದೇಶ ರಚಿಸಿ', en: 'Generate Order' },
  },

  // --- Dashboard ---
  dashboard: {
    welcome: { kn: 'ಸ್ವಾಗತ', en: 'Welcome' },
    memberFor: { kn: 'ದಿನಗಳಿಂದ ಸದಸ್ಯ', en: 'days member' },
    quickActions: { kn: 'ತ್ವರಿತ ಕ್ರಿಯೆಗಳು', en: 'Quick Actions' },
    ordersGenerated: { kn: 'ರಚಿಸಲಾದ ಆದೇಶಗಳು', en: 'Orders Generated' },
    creditsLeft: { kn: 'ಉಳಿದ ಕ್ರೆಡಿಟ್\u200Cಗಳು', en: 'Credits Left' },
    filesUploaded: { kn: 'ಅಪ್\u200Cಲೋಡ್ ಮಾಡಿದ ಫೈಲ್\u200Cಗಳು', en: 'Files Uploaded' },
    trainingStatus: { kn: 'ತರಬೇತಿ ಸ್ಥಿತಿ', en: 'Training Status' },
    recharge: { kn: 'ರೀಚಾರ್ಜ್', en: 'Recharge' },
    freeOrders: { kn: 'ನಿಮಗೆ 2 ಉಚಿತ ಆದೇಶಗಳಿವೆ!', en: 'You have 2 free orders!' },
    tryDemo: { kn: 'ಡೆಮೊ ಆದೇಶ ರಚಿಸಿ', en: 'Generate Demo Order' },
    orSeparator: { kn: 'ಅಥವಾ', en: 'or' },
    startTraining: { kn: 'AI ತರಬೇತಿ ಪ್ರಾರಂಭಿಸಿ', en: 'Start AI Training' },
    showYourOrders: { kn: 'AI ಗೆ ನಿಮ್ಮ ಆದೇಶಗಳನ್ನು ತೋರಿಸಿ', en: 'Show your orders to AI' },
  },

  // --- Guardrails ---
  guardrails: {
    allSectionsPresent: { kn: 'ಎಲ್ಲಾ ವಿಭಾಗಗಳು ಇವೆ', en: 'All sections present' },
    pureKannada: { kn: 'ಕನ್ನಡ ಮಾತ್ರ', en: 'Pure Kannada' },
    factsMatch: { kn: 'ಸಂಖ್ಯೆಗಳು ಸರಿಯಾಗಿವೆ', en: 'Facts verified' },
    sectionsMissing: { kn: 'ಕೆಲವು ವಿಭಾಗಗಳು ಕಾಣೆಯಾಗಿವೆ', en: 'Some sections missing' },
    englishDetected: { kn: 'ಆಂಗ್ಲ ಪದಗಳು ಕಂಡುಬಂದಿವೆ', en: 'English words detected' },
    factsMismatch: { kn: 'ಸಂಖ್ಯೆ ಹೊಂದಿಕೆಯಾಗಿಲ್ಲ', en: 'Number mismatch' },
    wordCountOk: { kn: 'ಪದ ಎಣಿಕೆ ಸರಿ', en: 'Word count OK' },
    wordCountWarn: { kn: 'ಪದ ಎಣಿಕೆ ಗಡಿ ಹೊರಗೆ', en: 'Word count out of range' },
  },

  // --- Credits ---
  credits: {
    remaining: { kn: 'ಉಳಿದ ಕ್ರೆಡಿಟ್\u200Cಗಳು', en: 'Credits remaining' },
    ordersGenerated: { kn: 'ರಚಿಸಿದ ಆದೇಶಗಳು', en: 'Orders generated' },
    buyMore: { kn: 'ಇನ್ನಷ್ಟು ಖರೀದಿಸಿ', en: 'Buy more' },
    insufficient: { kn: 'ಸಾಕಷ್ಟು ಕ್ರೆಡಿಟ್\u200Cಗಳಿಲ್ಲ', en: 'Insufficient credits' },
  },

  // --- Transfer ---
  transfer: {
    iTransferred: { kn: 'ನಾನು ವರ್ಗಾವಣೆಯಾಗಿದ್ದೇನೆ', en: 'I have transferred' },
    transferWarning: { kn: 'ನಿಮ್ಮ ಹಳೆಯ ಡೇಟಾ ಆರ್ಕೈವ್ ಆಗುತ್ತದೆ. AI ಹೊಸ ಆದೇಶಗಳಿಗಾಗಿ ಮರು-ತರಬೇತಿ ಬೇಕಾಗುತ್ತದೆ. ಮುಂದುವರಿಯಬೇಕೇ?', en: 'Your old data will be archived. AI will need retraining for new orders. Continue?' },
  },

  // --- Errors ---
  errors: {
    pleaseRetry: { kn: 'ದಯವಿಟ್ಟು ಮತ್ತೊಮ್ಮೆ ಪ್ರಯತ್ನಿಸಿ', en: 'Please try again' },
    uploadFailed: { kn: 'ಅಪ್\u200Cಲೋಡ್ ವಿಫಲವಾಗಿದೆ', en: 'Upload failed' },
    networkError: { kn: 'ನೆಟ್\u200Cವರ್ಕ್ ಸಮಸ್ಯೆ', en: 'Network issue' },
    creditInsufficient: { kn: 'ಸಾಕಷ್ಟು ಕ್ರೆಡಿಟ್\u200Cಗಳಿಲ್ಲ', en: 'Insufficient credits' },
    serverMaintenance: { kn: 'ಸರ್ವರ್ ನಿರ್ವಹಣೆ ನಡೆಯುತ್ತಿದೆ', en: 'Server maintenance in progress' },
    loginAgain: { kn: 'ದಯವಿಟ್ಟು ಮತ್ತೆ ಲಾಗಿನ್ ಮಾಡಿ', en: 'Please login again' },
    generationFailed: { kn: 'ಆದೇಶ ರಚನೆ ವಿಫಲವಾಯಿತು', en: 'Order generation failed' },
  },

  // --- Common ---
  common: {
    loading: { kn: 'ಲೋಡ್ ಆಗುತ್ತಿದೆ...', en: 'Loading...' },
    error: { kn: 'ದೋಷ', en: 'Error' },
    success: { kn: 'ಯಶಸ್ವಿ', en: 'Success' },
    cancel: { kn: 'ರದ್ದುಮಾಡಿ', en: 'Cancel' },
    confirm: { kn: 'ದೃಢೀಕರಿಸಿ', en: 'Confirm' },
    delete: { kn: 'ಅಳಿಸಿ', en: 'Delete' },
    download: { kn: 'ಡೌನ್\u200Cಲೋಡ್', en: 'Download' },
    share: { kn: 'ಹಂಚಿಕೊಳ್ಳಿ', en: 'Share' },
    save: { kn: 'ಉಳಿಸಿ', en: 'Save' },
    back: { kn: 'ಹಿಂದೆ', en: 'Back' },
    next: { kn: 'ಮುಂದೆ', en: 'Next' },
    view: { kn: 'ನೋಡಿ', en: 'View' },
    words: { kn: 'ಪದಗಳು', en: 'words' },
    files: { kn: 'ಫೈಲ್\u200Cಗಳು', en: 'files' },
  },
} as const;

// Helper to get a string by locale
export function t(key: Record<string, string> | string, locale: Locale = 'kn'): string {
  if (typeof key === 'object' && key !== null && locale in key) {
    return key[locale];
  }
  return String(key);
}

export default strings;
