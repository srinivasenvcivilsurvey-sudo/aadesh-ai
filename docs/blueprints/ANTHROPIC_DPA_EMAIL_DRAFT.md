# Draft Email: Anthropic Data Processing Agreement

**To:** privacy@anthropic.com  
**Subject:** Data Processing Agreement Request — Aadesh AI (Karnataka Government Order Drafting SaaS)  
**From:** srinivas.env.civilsurvey@gmail.com  

---

Dear Anthropic Privacy Team,

I am writing to request a Data Processing Agreement (DPA) for my use of the Claude API in a SaaS product called **Aadesh AI** (aadesh-ai.in).

**About the product:**
Aadesh AI is an AI-assisted drafting tool for Karnataka state government revenue officers in India. Officers upload government case files (PDFs), and the system generates order drafts in Sarakari Kannada (the formal administrative Kannada used in Karnataka Revenue Department orders).

**Data processing details:**
- **Data types processed:** Government case documents related to land revenue matters (survey numbers, measurements, legal citations). Before any data is sent to the Claude API, all personally identifiable information (citizen names, survey numbers, village names) is automatically masked using regex-based PII redaction. Masked tokens are re-injected locally after generation.
- **Data subjects:** Karnataka government officials (officers using the app); members of the public referenced in case files (PII masked before API transmission)
- **Processing purpose:** AI-assisted drafting of government orders — officers review all outputs before use
- **Volume:** Early stage — expected <100 orders/month at launch
- **Model used:** claude-sonnet-4-6 via API

**Why I need a DPA:**
I am building this service in compliance with India's **Digital Personal Data Protection Act, 2023 (DPDP Act)**. As a data fiduciary, I am required to have data processing agreements in place with all sub-processors, including AI providers.

**My details:**
- **Name:** Srinivas T
- **Business:** Aadesh AI (sole proprietorship), Bengaluru, Karnataka, India
- **Email:** srinivas.env.civilsurvey@gmail.com
- **Website:** aadesh-ai.in
- **Anthropic API usage:** API calls for order generation

Could you please provide the standard Anthropic DPA, or direct me to the appropriate process for small business customers?

Thank you for your assistance.

Best regards,  
Srinivas T  
Aadesh AI  
aadesh-ai.in  
srinivas.env.civilsurvey@gmail.com
