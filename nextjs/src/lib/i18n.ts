// Aadesh AI — Kannada + English UI strings
// All user-facing text lives here for easy translation

export type Locale = 'kn' | 'en';

const strings = {
  // ─── Branding ───
  productName: { kn: 'ಆದೇಶ AI', en: 'Aadesh AI' },
  tagline: { kn: 'ಕರ್ನಾಟಕ ಭೂದಾಖಲೆ ಕಚೇರಿಗಳಿಗೆ AI ಆದೇಶ ಕರಡು', en: 'AI Order Drafting for Karnataka Land Record Offices' },

  // ─── Nav / Layout ───
  nav: {
    dashboard: { kn: 'ಮುಖಪುಟ', en: 'Dashboard' },
    generateOrder: { kn: 'ಆದೇಶ ರಚಿಸಿ', en: 'Generate Order' },
    myOrders: { kn: 'ನನ್ನ ಆದೇಶಗಳು', en: 'My Orders' },
    uploadOrders: { kn: 'ಆದೇಶಗಳನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ', en: 'Upload Orders' },
    settings: { kn: 'ಸೆಟ್ಟಿಂಗ್‌ಗಳು', en: 'Settings' },
    billing: { kn: 'ಬಿಲ್ಲಿಂಗ್', en: 'Billing' },
    signOut: { kn: 'ಹೊರಬನ್ನಿ', en: 'Sign Out' },
    changePassword: { kn: 'ಪಾಸ್‌ವರ್ಡ್ ಬದಲಿಸಿ', en: 'Change Password' },
    signedInAs: { kn: 'ಇವರಾಗಿ ಲಾಗಿನ್:', en: 'Signed in as' },
  },

  // ─── Landing Page ───
  landing: {
    hero: { kn: 'ಸರ್ಕಾರಿ ಆದೇಶಗಳನ್ನು ನಿಮಿಷಗಳಲ್ಲಿ ರಚಿಸಿ', en: 'Draft Government Orders in Minutes' },
    heroSub: { kn: 'ಸರಕಾರಿ ಕನ್ನಡದಲ್ಲಿ AI-ಚಾಲಿತ ಆದೇಶ ಕರಡು. ವೇಗವಾಗಿ, ನಿಖರವಾಗಿ, ಕಡಿಮೆ ವೆಚ್ಚದಲ್ಲಿ.', en: 'AI-powered order drafting in Sarakari Kannada. Faster, accurate, affordable.' },
    getStarted: { kn: 'ಈಗ ಪ್ರಾರಂಭಿಸಿ', en: 'Get Started' },
    login: { kn: 'ಲಾಗಿನ್', en: 'Login' },
    features: { kn: 'ವೈಶಿಷ್ಟ್ಯಗಳು', en: 'Features' },
    pricing: { kn: 'ಬೆಲೆ', en: 'Pricing' },
  },

  // ─── Features ───
  features: {
    aiDrafting: { kn: 'AI ಆದೇಶ ಕರಡು', en: 'AI Order Drafting' },
    aiDraftingDesc: { kn: 'ಸರಕಾರಿ ಕನ್ನಡದಲ್ಲಿ 13-ವಿಭಾಗ ಆದೇಶಗಳನ್ನು ಸ್ವಯಂ ರಚಿಸಿ', en: 'Auto-generate 13-section orders in Sarakari Kannada' },
    secureStorage: { kn: 'ಸುರಕ್ಷಿತ ಸಂಗ್ರಹ', en: 'Secure Storage' },
    secureStorageDesc: { kn: 'ನಿಮ್ಮ ಆದೇಶಗಳು ಮತ್ತು ಡಾಕ್ಯುಮೆಂಟ್‌ಗಳು ಸುರಕ್ಷಿತ', en: 'Your orders and documents are protected' },
    kannadaFirst: { kn: 'ಕನ್ನಡ ಮೊದಲು', en: 'Kannada First' },
    kannadaFirstDesc: { kn: 'ಸರಕಾರಿ ಕನ್ನಡ ಪರಿಭಾಷೆ ಮತ್ತು ಶೈಲಿ', en: 'Sarakari Kannada terminology and style' },
    docxPdf: { kn: 'DOCX & PDF', en: 'DOCX & PDF' },
    docxPdfDesc: { kn: 'ಪ್ರೊಫೆಷನಲ್ ಫಾರ್ಮ್ಯಾಟ್‌ನಲ್ಲಿ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ', en: 'Download in professional format' },
  },

  // ─── Pricing (Recharge Packs) ───
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

  // ─── Order Generation ───
  generate: {
    title: { kn: 'ಹೊಸ ಆದೇಶ ರಚಿಸಿ', en: 'Generate New Order' },
    orderType: { kn: 'ಆದೇಶ ಪ್ರಕಾರ', en: 'Order Type' },
    appeal: { kn: 'ಮೇಲ್ಮನವಿ (ಅಪೀಲ್)', en: 'Appeal' },
    suoMotu: { kn: 'ಸ್ವಯಂಪ್ರೇರಿತ (ಸುಮೋಟೋ)', en: 'Suo Motu' },
    caseDetails: { kn: 'ಪ್ರಕರಣ ವಿವರಗಳು', en: 'Case Details' },
    caseDetailsPlaceholder: { kn: 'ಪ್ರಕರಣದ ಎಲ್ಲಾ ವಿವರಗಳನ್ನು ಇಲ್ಲಿ ನಮೂದಿಸಿ...', en: 'Enter all case details here...' },
    generateBtn: { kn: 'ಆದೇಶ ರಚಿಸಿ', en: 'Generate Order' },
    generating: { kn: 'ರಚಿಸಲಾಗುತ್ತಿದೆ...', en: 'Generating...' },
    creditsRemaining: { kn: 'ಉಳಿದ ಕ್ರೆಡಿಟ್‌ಗಳು', en: 'Credits remaining' },
    noCredits: { kn: 'ಕ್ರೆಡಿಟ್‌ಗಳು ಖಾಲಿಯಾಗಿವೆ. ದಯವಿಟ್ಟು ರೀಚಾರ್ಜ್ ಮಾಡಿ.', en: 'No credits remaining. Please recharge.' },
    uploadCase: { kn: 'ಪ್ರಕರಣ ಫೈಲ್ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ', en: 'Upload Case File' },
    acceptedFormats: { kn: '.docx ಅಥವಾ .pdf ಫೈಲ್ ಮಾತ್ರ', en: '.docx or .pdf files only' },
  },

  // ─── Order Result / Download ───
  result: {
    orderGenerated: { kn: 'ಆದೇಶ ರಚಿಸಲಾಗಿದೆ', en: 'Order Generated' },
    downloadDocx: { kn: 'DOCX ಡೌನ್‌ಲೋಡ್', en: 'Download DOCX' },
    downloadPdf: { kn: 'PDF ಡೌನ್‌ಲೋಡ್', en: 'Download PDF' },
    verifyCheckbox: { kn: 'ನಾನು ಈ ಆದೇಶವನ್ನು ಪರಿಶೀಲಿಸಿದ್ದೇನೆ ಮತ್ತು ಇದರ ವಿಷಯಕ್ಕೆ ಜವಾಬ್ದಾರನಾಗಿದ್ದೇನೆ', en: 'I have verified this order and take responsibility for its content' },
    mustVerify: { kn: 'ಡೌನ್‌ಲೋಡ್ ಮಾಡಲು ಮೊದಲು ಪರಿಶೀಲಿಸಿ', en: 'Please verify before downloading' },
    regenerate: { kn: 'ಮರುರಚಿಸಿ', en: 'Regenerate' },
    wordCount: { kn: 'ಪದ ಸಂಖ್ಯೆ', en: 'Word count' },
    sections: { kn: 'ವಿಭಾಗಗಳು', en: 'Sections' },
  },

  // ─── Upload (Training Orders) ───
  upload: {
    title: { kn: 'ನಿಮ್ಮ ಆದೇಶಗಳನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ', en: 'Upload Your Orders' },
    description: { kn: 'AI ನಿಮ್ಮ ಶೈಲಿಯನ್ನು ಕಲಿಯಲು ನಿಮ್ಮ ಅಂತಿಮ ಆದೇಶಗಳನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ', en: 'Upload your finalized orders so AI can learn your style' },
    dragDrop: { kn: 'ಫೈಲ್ ಇಲ್ಲಿ ಎಳೆದು ಬಿಡಿ ಅಥವಾ ಕ್ಲಿಕ್ ಮಾಡಿ', en: 'Drag and drop files here or click to select' },
    acceptedFormatsLong: { kn: '.docx ಮತ್ತು .pdf ಫೈಲ್‌ಗಳು ಮಾತ್ರ (ಗರಿಷ್ಠ 50MB)', en: '.docx and .pdf files only (max 50MB)' },
    uploading: { kn: 'ಅಪ್‌ಲೋಡ್ ಆಗುತ್ತಿದೆ...', en: 'Uploading...' },
    uploadSuccess: { kn: 'ಫೈಲ್ ಯಶಸ್ವಿಯಾಗಿ ಅಪ್‌ಲೋಡ್ ಆಯಿತು', en: 'File uploaded successfully' },
    uploadFailed: { kn: 'ಅಪ್‌ಲೋಡ್ ವಿಫಲವಾಯಿತು', en: 'Upload failed' },
    noFiles: { kn: 'ಯಾವುದೇ ಫೈಲ್ ಅಪ್‌ಲೋಡ್ ಆಗಿಲ್ಲ', en: 'No files uploaded yet' },
  },

  // ─── Dashboard ───
  dashboard: {
    welcome: { kn: 'ಸ್ವಾಗತ', en: 'Welcome' },
    memberFor: { kn: 'ದಿನಗಳಿಂದ ಸದಸ್ಯ', en: 'days member' },
    quickActions: { kn: 'ತ್ವರಿತ ಕ್ರಿಯೆಗಳು', en: 'Quick Actions' },
    ordersGenerated: { kn: 'ರಚಿಸಲಾದ ಆದೇಶಗಳು', en: 'Orders Generated' },
    creditsLeft: { kn: 'ಉಳಿದ ಕ್ರೆಡಿಟ್‌ಗಳು', en: 'Credits Left' },
    recharge: { kn: 'ರೀಚಾರ್ಜ್', en: 'Recharge' },
  },

  // ─── Common ───
  common: {
    loading: { kn: 'ಲೋಡ್ ಆಗುತ್ತಿದೆ...', en: 'Loading...' },
    error: { kn: 'ದೋಷ', en: 'Error' },
    success: { kn: 'ಯಶಸ್ವಿ', en: 'Success' },
    cancel: { kn: 'ರದ್ದುಮಾಡಿ', en: 'Cancel' },
    confirm: { kn: 'ದೃಢೀಕರಿಸಿ', en: 'Confirm' },
    delete: { kn: 'ಅಳಿಸಿ', en: 'Delete' },
    download: { kn: 'ಡೌನ್‌ಲೋಡ್', en: 'Download' },
    share: { kn: 'ಹಂಚಿಕೊಳ್ಳಿ', en: 'Share' },
    save: { kn: 'ಉಳಿಸಿ', en: 'Save' },
    back: { kn: 'ಹಿಂದೆ', en: 'Back' },
    next: { kn: 'ಮುಂದೆ', en: 'Next' },
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
