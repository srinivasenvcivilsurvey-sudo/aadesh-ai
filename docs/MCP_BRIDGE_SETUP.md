# MCP BRIDGE SETUP — How to Recreate the 3-Tool System on Any Laptop
# Version: 1.0 | April 11, 2026
# 
# This file tells you exactly how to set up the Claude Chat + Cowork + Claude Code
# integration on a NEW laptop from scratch in under 30 minutes.

---

## WHAT THE BRIDGE IS

You have 3 Claude tools working as a team:

```
┌─────────────────────────────────────────────────────────────┐
│                    THE THREE TOOLS                           │
│                                                             │
│  Claude.ai Chat     ←→    TEAM_INBOX    ←→  Claude Code    │
│  (Cowork/Brain)           (Shared folder)    (Hands/Code)  │
│                                                             │
│  - Plans tasks             Files on disk     - Executes    │
│  - Reads results           both can see      - Tests       │
│  - Strategy                and write to      - Deploys     │
└─────────────────────────────────────────────────────────────┘
```

The "bridge" is NOT a complex technical thing.
It is simply: a SHARED FOLDER that both tools can read and write.
Claude.ai (Chat/Cowork) reads files via the `ddlr-filesystem` MCP tool.
Claude Code reads the same folder natively (it's the working directory).

---

## WHAT MCPs YOU HAVE INSTALLED

### On Claude.ai (Chat/Cowork):
These are connected via claude.ai → Settings → Integrations:

| MCP | Purpose | Connection |
|-----|---------|-----------|
| **ddlr-filesystem** | Read/write Banu folder directly | Points to C:\Users\north\OneDrive\Attachments\Desktop\Banu |
| **Notion** | Update project hub | Connected via Notion OAuth |
| **Google Calendar** | Schedule management | Connected via Google OAuth |
| **Gmail** | Email management | Connected via Google OAuth |
| **Craft** | Document creation | Connected via Craft OAuth |
| **Canva** | Design work | Connected via Canva OAuth |
| **Base44** | Admin dashboards | Connected via Base44 OAuth |
| **Firecrawl** | Web research | API key based |
| **Supabase** | Database access | Connected via Supabase OAuth |

### On Claude Code (VS Code):
Claude Code reads `.mcp.json` in the project root for project-specific MCPs.
Current `.mcp.json` has TestSprite (API key needs rotation).
Claude Code has built-in access to bash, file system, browser.

---

## SETUP ON NEW LAPTOP — STEP BY STEP

### STEP 1: Copy the Banu folder (5 minutes)
```
Option A: OneDrive sync (automatic if you log in with same Microsoft account)
- Install OneDrive on new laptop
- Log in with same Microsoft account
- Wait for sync — Banu folder appears automatically at same path

Option B: Manual copy
- Plug in USB drive or use Google Drive
- Copy entire: C:\Users\north\OneDrive\Attachments\Desktop\Banu\
- Paste to same path on new laptop
```

### STEP 2: Install VS Code + Claude Code (10 minutes)
```
1. Download VS Code: https://code.visualstudio.com/
2. Install it
3. Open VS Code
4. Go to Extensions (Ctrl+Shift+X)
5. Search "Claude Code" → Install
6. Sign in with your Claude account (the one with Max subscription)
7. Open folder: File → Open Folder → Select the Banu folder
```

### STEP 3: Install Python + required libraries (5 minutes)
```bash
# Check if Python is installed:
python --version

# If not, download from: https://python.org → Download Python 3.11+

# Install required libraries:
pip install anthropic python-docx requests python-dotenv
```

### STEP 4: Set up environment variables (2 minutes)
The API keys are already in the Banu folder (they come with OneDrive sync):
- `aadesh-ai/nextjs/.env.local` — web app keys
- `KarnatakaAI/11_DDLR_App/.env` — local test keys

No action needed if OneDrive synced correctly.

### STEP 5: Connect ddlr-filesystem MCP on Claude.ai (5 minutes)
This is the most important step — it lets Claude Chat/Cowork read the Banu folder.

```
1. Go to claude.ai
2. Click your profile icon → Settings
3. Click "Integrations" or "MCP Servers"  
4. Look for "Desktop Commander" or "Filesystem" integration
5. Add the Banu folder path:
   C:\Users\{your-username}\OneDrive\Attachments\Desktop\Banu
   
NOTE: The path changes based on your Windows username.
On current laptop: C:\Users\north\OneDrive\Attachments\Desktop\Banu
On new laptop: C:\Users\{new-username}\OneDrive\Attachments\Desktop\Banu
```

### STEP 6: Reconnect OAuth integrations on Claude.ai (5 minutes)
These reconnect with just a login — no setup needed:
- Notion: click "Connect Notion" → log in → done
- Gmail: click "Connect Gmail" → log in → done
- Google Calendar: same
- Craft: same
- Canva: same
- Supabase: same

### STEP 7: Verify everything works
```
Open Claude.ai Chat → type:
"Check MASTER_CONTEXT.md in my Banu folder and tell me the current state of the project"

If it can read the file → bridge is working ✅
If it says "I can't access files" → ddlr-filesystem MCP needs reconnecting
```

---

## IMPORTANT PATHS THAT CHANGE ON NEW LAPTOP

When you get a new laptop, update this in MASTER_CONTEXT.md:

| Item | Current path | New laptop path |
|------|-------------|----------------|
| Banu folder | C:\Users\**north**\OneDrive\... | C:\Users\**{new-name}**\OneDrive\... |
| test script | ...Desktop\Banu\KarnatakaAI\11_DDLR_App\phase0_test_v2.py | Same (if same username) |
| ddlr-filesystem MCP | Points to \north\ path | Update to new username path |

---

## NOTION HUB IDs (these never change — cloud-based)

| Page | ID | URL |
|------|----|----|
| Main Hub | 324290d32bc680649230c47760b400e5 | notion.so/324290d32bc680649230c47760b400e5 |
| Claude Code Updates | 32f290d32bc6819e9653e1e760587186 | notion.so/32f290d32bc6819e9653e1e760587186 |
| Decisions DB | 05bc222d-bbd4-452d-92bc-7313bdc3ebc1 | — |
| Tasks DB | bf1938c4-cf1d-4fda-9b1e-2813e707aadb | — |

---

## IF SOMETHING BREAKS

| Problem | Fix |
|---------|-----|
| Claude Chat can't read Banu folder | Reconnect ddlr-filesystem MCP, update path |
| Claude Code can't run Python | pip install anthropic python-docx requests |
| API calls failing | Check .env files still have correct keys |
| VPS unreachable | DigitalOcean console → check if server is running → pm2 restart aadesh-ai |
| Supabase unreachable | Check if India block is back → set up custom domain or self-host |

---

## WHAT THE .mcp.json FILE DOES

The `.mcp.json` in the Banu folder root is for Claude Code project-specific MCPs.
Current content: only TestSprite (not critical).

To add new MCP servers for Claude Code:
```json
{
  "mcpServers": {
    "server-name": {
      "command": "npx",
      "args": ["@package/name"],
      "env": {
        "API_KEY": "your-key-here"
      }
    }
  }
}
```

The important MCPs (Notion, filesystem, etc.) are on Claude.ai, not in .mcp.json.
Claude Code accesses files directly — it doesn't need filesystem MCP.

---

*Last updated: April 11, 2026 by Cowork*
*Next update: When laptop changes or new MCPs are added*
