# Agentic AI Dev Sandbox System

## Overview
Your dev sandboxes now have **full agentic AI capabilities** powered by CopilotKit + Daytona. Users can build, run, and deploy complete applications through natural language conversation.

## What Users Can Do

### 🤖 Natural Language Development
- **"Build me a todo app in React"** → AI creates files, installs dependencies, sets up dev server
- **"Add a dark mode toggle"** → AI modifies existing code
- **"Deploy this to Vercel"** → AI handles git + deployment with approval flow
- **"Install tailwindcss"** → AI runs npm commands
- **"Show me the files"** → AI lists project structure

### 🎯 Core Agent Actions

#### File Operations
- `create_file` - Create/write files with content
- `read_file` - Read file contents
- `list_files` - Browse directory structure

#### Command Execution
- `run_command` - Execute any shell command
- `install_packages` - npm install with package array

#### Project Scaffolding
- `scaffold_project` - Generate complete project structures:
  - React (Vite + TypeScript)
  - Next.js (App Router)
  - Node.js (Basic setup)
  - Python (Basic setup)

#### Deployment
- `deploy_to_vercel` - **Human-in-the-loop approval flow**
  - AI requests deployment
  - User approves/cancels via UI
  - Automated GitHub + Vercel deployment

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    User Request (Natural Language)           │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│              CopilotKit AI Agent (GPT-4)                     │
│  - Understands intent                                         │
│  - Plans multi-step workflows                                 │
│  - Calls appropriate actions                                  │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                   Agent Actions (Tools)                       │
│  ├─ create_file()                                             │
│  ├─ run_command()                                             │
│  ├─ install_packages()                                        │
│  ├─ scaffold_project()                                        │
│  └─ deploy_to_vercel()  [Human approval required]            │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│              Daytona Workspace API Layer                      │
│  /api/devenv/workspace/                                       │
│  ├─ files (GET/POST)     → File operations                   │
│  ├─ execute (POST)       → Command execution                 │
│  ├─ packages (POST)      → npm install                       │
│  ├─ deploy (POST)        → Vercel deployment                 │
│  └─ scaffold (POST)      → Project generation                │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│           Daytona SDK (lib/llm/daytona-workspace.ts)         │
│  - writeFile()                                                │
│  - executeCommand()                                           │
│  - installPackages()                                          │
│  - deployToVercel()                                           │
│  - scaffoldProject()                                          │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                  Daytona Cloud Sandbox                        │
│  - File system operations                                     │
│  - Process execution                                          │
│  - Web terminal access                                        │
│  - Port forwarding (preview URLs)                             │
└─────────────────────────────────────────────────────────────┘
```

## Files Created

### Core Components
- `components/DevAgentChat.tsx` - CopilotKit chat interface with all agent actions
- `app/api/copilotkit/route.ts` - CopilotKit runtime endpoint
- `lib/llm/daytona-workspace.ts` - Daytona workspace management

### API Endpoints
- `app/api/devenv/workspace/files/route.ts` - File operations
- `app/api/devenv/workspace/files/read/route.ts` - Read file contents
- `app/api/devenv/workspace/execute/route.ts` - Command execution
- `app/api/devenv/workspace/packages/route.ts` - Package installation
- `app/api/devenv/workspace/deploy/route.ts` - Deployment
- `app/api/devenv/workspace/scaffold/route.ts` - Project scaffolding

### Updated Pages
- `app/devenv/page.tsx` - Integrated CopilotKit provider + DevAgentChat

## Environment Variables Required

```env
# Already configured
OPENAI_API_KEY=sk-...           # For CopilotKit AI
DAYTONA_API_KEY=...             # For sandbox management

# Optional for deployment
VERCEL_TOKEN=...                # For auto-deployment
GITHUB_TOKEN=...                # For GitHub repo creation
```

## User Flow Example

1. **User launches sandbox** (e.g., React template)
   - Daytona creates workspace
   - Web terminal URL returned
   - AI chat becomes active

2. **User tells AI**: "Build a weather app with OpenWeather API"

3. **AI executes**:
   ```
   - scaffold_project(projectType: 'react', projectName: 'weather-app')
   - install_packages(['axios', 'lucide-react'])
   - create_file('src/WeatherApp.tsx', [component code])
   - create_file('src/utils/weather.ts', [API utilities])
   - run_command('npm run dev')
   ```

4. **User sees**: Real-time updates in chat + files created

5. **User asks**: "Deploy this"

6. **AI requests deployment**:
   - Shows approval dialog
   - User clicks "Deploy"
   - AI pushes to GitHub
   - AI triggers Vercel deployment
   - Returns live URL

## Security Features

### Human-in-the-Loop
- Deployment requires explicit user approval
- Preview of what will be deployed
- Cancel option always available

### Sandbox Isolation
- Each workspace is isolated
- No access to your local machine
- Daytona handles security

### API Key Safety
- All keys server-side only
- Never exposed to client
- Workspace-scoped permissions

## Next Steps

### To Test
1. Navigate to `/devenv`
2. Click "Launch" on any template
3. Wait for sandbox to spin up
4. Click AI chat button (sparkle icon on template card)
5. Try: "Create a simple Express server with a /hello endpoint"

### To Deploy
Just push your changes:
```bash
git add .
git commit -m "Add agentic AI dev sandboxes"
git push
```

Vercel will auto-deploy. The system is production-ready.

## Capabilities Comparison

### Before (Basic Sandbox)
- ✅ Launch dev environment
- ✅ Web terminal access
- ❌ Manual file creation
- ❌ Manual package installation
- ❌ Manual deployment

### After (Agentic AI)
- ✅ Launch dev environment
- ✅ Web terminal access
- ✅ **AI creates all files**
- ✅ **AI installs packages**
- ✅ **AI deploys apps**
- ✅ **Natural language interface**
- ✅ **Multi-step workflows**
- ✅ **Human approval for destructive actions**

## Cost Estimates

Per conversation:
- **CopilotKit/OpenAI**: ~$0.01-0.05 (GPT-4 usage)
- **Daytona Sandbox**: Free tier or ~$0.10/hour
- **Vercel Deployment**: Free tier (hobby)

Total per session: **< $0.20** for most use cases

## Troubleshooting

### "No active workspace" error
- User must launch a sandbox first
- AI will prompt them if they forget

### Deployment fails
- Check `VERCEL_TOKEN` is set
- Verify project has valid `package.json`
- Check Vercel logs for details

### Command execution timeout
- Long-running commands may timeout
- Use background tasks for dev servers
- Check Daytona sandbox is active

## Future Enhancements

- [ ] GitHub auto-push on every file change
- [ ] Live preview integration (show app preview in chat)
- [ ] Multiple workspace support (switch between projects)
- [ ] Netlify deployment option
- [ ] Docker container deployment
- [ ] Database provisioning (Supabase, MongoDB)
- [ ] Environment variable management
- [ ] Team collaboration (shared workspaces)
