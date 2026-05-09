# AADESH AI — SETUP ON A NEW LAPTOP
# Version: 1.0 | Created: April 11, 2026
# 
# This file tells you EXACTLY how to move the entire Aadesh AI system
# to a new laptop and get it working in under 45 minutes.
# No technical knowledge needed — follow each step.

---

## WHAT YOU ARE SETTING UP

You have 3 tools that work as a team:
1. **Claude.ai Chat / Cowork** — browser tool at claude.ai
2. **Claude Code** — VS Code extension, for coding
3. **The Bridge** — a shared folder (Banu folder) both tools can read

The entire system runs from ONE FOLDER: the Banu folder.
If the Banu folder is on the new laptop, everything works.

---

## TOTAL TIME: ~45 minutes

| Step | What | Time |
|------|------|------|
| Step 1 | Copy Banu folder | 5-10 min (depends on internet/USB) |
| Step 2 | Install VS Code + Claude Code | 10 min |
| Step 3 | Install Node.js + Python | 5 min |
| Step 4 | Set up Claude Code project | 5 min |
| Step 5 | Reconnect Claude.ai MCPs | 15 min |
| Step 6 | Test everything | 5 min |

---

## STEP 1: COPY THE BANU FOLDER (most important step)

The Banu folder lives at:
```
C:\Users\north\OneDrive\Attachments\Desktop\Banu\
```

**Option A — OneDrive (EASIEST, automatic):**
```
1. On new laptop, install OneDrive
   Download: https://www.microsoft.com/en-us/microsoft-365/onedrive/download
   
2. Sign in with the SAME Microsoft account (the one with northstar / Srinivas login)

3. Wait for OneDrive to sync
   Status: look at taskbar → OneDrive cloud icon → should show "Up to date"
   Time: depends on internet speed (folder is ~5-10 GB with all order files)

4. After sync, go to:
   C:\Users\[YourName]\OneDrive\Attachments\Desktop\Banu\
   All files should be there.
```

**Option B — USB Drive (if no OneDrive):**
```
1. On OLD laptop, plug in USB drive (need 15+ GB free space)

2. Copy this entire folder to USB:
   C:\Users\north\OneDrive\Attachments\Desktop\Banu\

3. On NEW laptop, paste to SAME path:
   C:\Users\[YourName]\OneDrive\Attachments\Desktop\Banu\
   (Create the folders if they don't exist)

NOTE: If your username is different on new laptop, the path will be slightly different.
      That's OK — just remember the new path, you'll need it in Step 5.
```

**Option C — Google Drive / Shared Drive:**
```
1. On OLD laptop, upload Banu folder to Google Drive
2. On NEW laptop, download it
3. Place at: C:\Users\[YourName]\Desktop\Banu\ (or any location you prefer)
```

---

## STEP 2: INSTALL VS CODE + CLAUDE CODE

**Install VS Code:**
```
1. Go to: https://code.visualstudio.com/
2. Click Download for Windows
3. Run the installer, use all default settings
4. Open VS Code after install
```

**Install Claude Code extension:**
```
1. In VS Code, press: Ctrl + Shift + X (opens Extensions panel)
2. In search box, type: Claude Code
3. Find "Claude Code" by Anthropic → click Install
4. Wait for install to complete
5. You will see a Claude icon appear in the left sidebar
```

**Sign in to Claude Code:**
```
1. Click the Claude icon in VS Code sidebar
2. Click "Sign in with Claude"
3. It opens a browser → log in with your Claude account
   (The account with the Max subscription — this is important for full access)
4. Authorize the connection
5. VS Code shows your account is connected
```

**Open the Banu folder in VS Code:**
```
1. In VS Code: File → Open Folder
2. Navigate to: C:\Users\[YourName]\OneDrive\Attachments\Desktop\Banu\
3. Click "Select Folder"
4. VS Code now shows all Banu files in the left panel
```

---

## STEP 3: INSTALL NODE.JS + PYTHON

**Install Node.js (for the Next.js web app):**
```
1. Go to: https://nodejs.org/
2. Download the LTS version (long-term support)
3. Run installer, use all default settings
4. Verify: open Windows Terminal or Command Prompt
   Type: node --version
   Should show: v20.x.x or higher
```

**Install Python (for local test app):**
```
1. Go to: https://python.org/downloads/
2. Download Python 3.11 or higher
3. During install: CHECK THE BOX "Add Python to PATH" ← very important!
4. Complete install
5. Verify: open Command Prompt
   Type: python --version
   Should show: Python 3.11.x or higher
```

**Install Python libraries:**
```
Open Command Prompt and run these commands one by one:

pip install anthropic
pip install python-docx
pip install requests
pip install python-dotenv
pip install streamlit
pip install fpdf2
```

**Install Node.js libraries for the web app:**
```
1. In Windows Terminal, navigate to:
   cd "C:\Users\[YourName]\OneDrive\Attachments\Desktop\Banu\aadesh-ai\nextjs"

2. Run:
   npm install

3. Wait for it to finish (1-5 minutes)
```

---

## STEP 4: SET UP CLAUDE CODE PROJECT

**The Banu folder is already pre-configured.** Claude Code reads two files automatically:
- `.claude/settings.local.json` — permissions
- `.mcp.json` — project MCPs
- `CLAUDE.md` — Claude Code's instruction file

**All you need to do:**

```
1. Claude Code should auto-detect these files when you open the Banu folder
2. If asked "Do you trust this folder?" → click Yes, I trust the authors
3. Claude Code is now ready
```

**Verify Claude Code is working:**
```
1. In VS Code, press: Ctrl + Shift + P
2. Type: Claude Code
3. Start a new chat
4. Ask: "What folder am I in?"
5. Claude Code should tell you the Banu folder path
```

---

## STEP 5: RECONNECT CLAUDE.AI MCPs (Claude.ai Chat / Cowork)

This is the most important step for the "bridge" to work.

**What MCPs are:**
MCPs (Model Context Protocol) are plugins that give Claude.ai extra powers.
The most critical one is `ddlr-filesystem` which lets Claude.ai read your Banu folder.

**How to reconnect each MCP:**

### A. ddlr-filesystem (CRITICAL — lets Claude.ai read Banu folder)
```
1. Go to claude.ai → Click your profile picture → Settings → Integrations
2. Find "ddlr-filesystem" (or "Filesystem MCP")
   If it exists: Edit it, update the path to the new Banu folder location
   If it doesn't exist: Click "Add Integration" → follow setup for filesystem MCP
   
3. The path to set:
   C:\Users\[YourName]\OneDrive\Attachments\Desktop\Banu\
   (Replace [YourName] with your actual Windows username)

4. Test: In Claude.ai chat, ask: "List files in my Banu folder"
   Claude should be able to see the files.
```

### B. Notion
```
1. Go to claude.ai → Settings → Integrations → Find Notion
2. Click "Reconnect" or "Connect"
3. Log in to Notion with same account
4. Authorize access
5. Test: ask Claude to "read my Notion project page"
```

### C. Gmail
```
1. Go to claude.ai → Settings → Integrations → Find Gmail
2. Click "Reconnect" → authorize with same Google account
3. This also reconnects Google Calendar at the same time
```

### D. Other MCPs (Craft, Canva, Base44, Firecrawl, Supabase):
```
Same process for each:
1. Settings → Integrations → Find the MCP
2. Reconnect / authorize
3. Some need API keys (check _archive/_bridge_tools/ for notes on these)
```

---

## STEP 6: TEST EVERYTHING

**Test 1: Claude Code working:**
```
1. In VS Code → Claude Code chat
2. Ask: "Read the file PROJECT_JOURNAL.md and tell me the current quality score"
3. Claude Code should read the file and answer correctly
```

**Test 2: Claude.ai bridge working:**
```
1. Go to claude.ai
2. Start new chat
3. Ask: "Using the filesystem MCP, read PROJECT_JOURNAL.md in my Banu folder"
4. Claude should be able to read the file and answer
```

**Test 3: Live app running:**
```
1. Open Command Prompt
2. Navigate to: cd "C:\Users\[YourName]\OneDrive\Attachments\Desktop\Banu\aadesh-ai\nextjs"
3. Run: npm run dev
4. Open browser: http://localhost:3000
5. Should see Aadesh AI login page
```

**Test 4: Local test app (Streamlit):**
```
1. Open Command Prompt
2. Navigate to: cd "C:\Users\[YourName]\OneDrive\Attachments\Desktop\Banu\KarnatakaAI\11_DDLR_App"
3. Run: streamlit run app.py
4. Open browser: http://localhost:8501
5. Should see the DDLR test app
```

---

## CRITICAL FILES — API KEYS LOCATION

The API keys are stored in these files (they come with the Banu folder):

| File | What keys | Notes |
|------|----------|-------|
| `aadesh-ai/nextjs/.env.local` | All production keys | NEVER commit to GitHub |
| `KarnatakaAI/11_DDLR_App/.env` | Local test keys | NEVER commit to GitHub |
| `.mcp.json` | TestSprite MCP key | ⚠️ Key needs rotation — regenerate from TestSprite dashboard |

**If API keys are expired or not working:**
```
1. Anthropic API key: https://console.anthropic.com → API Keys → Create new key
2. Sarvam API key: https://sarvam.ai → Dashboard → API Keys
3. Supabase: Settings → API → Copy anon/service_role keys
4. Razorpay: Dashboard → Settings → API Keys
```

---

## WHAT TO DO IF SOMETHING BREAKS

**Problem: OneDrive didn't sync properly (some files missing)**
```
Fix: Right-click Banu folder in File Explorer → OneDrive → "Always keep on this device"
Then wait for full sync (may take hours if folder is large)
```

**Problem: npm install fails**
```
Fix: 
1. Delete the folder: aadesh-ai/nextjs/node_modules/
2. Run again: npm install
3. If still fails: npm install --legacy-peer-deps
```

**Problem: Python pip install fails**
```
Fix: pip install [package] --break-system-packages
Or: python -m pip install [package]
```

**Problem: Claude Code can't see files**
```
Fix:
1. File → Close Folder
2. File → Open Folder → Select Banu folder again
3. If asked "Trust this folder?" → click Yes
```

**Problem: Claude.ai MCP not working**
```
Fix:
1. Settings → Integrations → Disconnect the MCP
2. Reconnect it
3. If filesystem MCP path is wrong → update to new laptop path
```

---

## WHAT IS IN GITHUB (source code backup)

GitHub repo: `srinivasenvcivilsurvey-sudo/aadesh-ai`
```
Contains:
- Next.js source code
- System prompts
- Test scripts
- Documentation

Does NOT contain:
- .env.local (API keys — in OneDrive only)
- node_modules/ (generated, recreate with npm install)
- .next/ (generated build files)
- _BACKUP_RAW_BANU_ORIGINALS/ (too large, in OneDrive only)
```

**To restore from GitHub if OneDrive fails:**
```
1. git clone https://github.com/srinivasenvcivilsurvey-sudo/aadesh-ai
2. Then manually add .env.local (you need to store keys somewhere safe separately)
3. Run npm install
```

---

## AFTER SETUP — VERIFY THE THREE TOOLS TALK TO EACH OTHER

The "bridge" between Claude tools is the TEAM_INBOX folder.

**Quick test sequence:**
```
1. In Claude Code: create a test file
   → Write: "TEST from Claude Code: working on [today's date]" to TEAM_INBOX/test.txt

2. In Claude.ai Chat: ask it to read the test file
   → "Using filesystem MCP, read TEAM_INBOX/test.txt in my Banu folder"
   → Claude.ai should see what Claude Code wrote

3. If step 2 works → BRIDGE IS WORKING ✅
```

---

## QUICK REFERENCE — USEFUL COMMANDS

```bash
# Start production web app (local dev mode)
cd aadesh-ai/nextjs && npm run dev
# Then open: http://localhost:3000

# Start local test app (Streamlit)  
cd KarnatakaAI/11_DDLR_App && streamlit run app.py
# Then open: http://localhost:8501

# Run quality test on Banu PDFs
cd KarnatakaAI/11_DDLR_App && python phase0_test_v2.py

# Check VPS status
curl https://aadesh-ai.in/health

# Deploy to VPS (after changes)
cd aadesh-ai/nextjs && git add . && git commit -m "update" && git push
# VPS auto-deploys via PM2

# Check if app is running on VPS
# SSH: ssh root@165.232.176.181
# Then: pm2 status
```

---

*Created by Cowork (Claude.ai) on April 11, 2026.*
*If you are setting up on a new laptop and something is unclear,*
*show this file to Claude.ai Chat and say: "Help me complete step [X]"*
