# 🚀 Installing Claude Code on Windows: The Complete Guide

*A step-by-step guide to getting Claude Code running on Windows with WSL*

---

## What is Claude Code?

Claude Code is Anthropic's AI-powered coding assistant that lives in your terminal. Unlike browser-based AI assistants, Claude Code can:

- **Read and edit files** directly in your codebase
- **Run terminal commands** on your behalf
- **Navigate projects** and understand context across multiple files
- **Execute complex multi-step tasks** autonomously

Think of it as having a senior developer pair programming with you, but one that never gets tired and knows every programming language.

---

## Prerequisites

Before we start, you'll need:

- ✅ Windows 10 (version 2004+) or Windows 11
- ✅ Administrator access
- ✅ An Anthropic API key (or Claude Pro/Max subscription)
- ✅ About 15-30 minutes

---

## Choose Your Path

**Good news!** Claude Code now works natively on Windows. You have two options:

| **Option A: Native Windows** | **Option B: WSL** |
|------------------------------|-------------------|
| ⚡ Faster setup (5 min) | 🔧 Better for Unix tools |
| ✅ Works in PowerShell/CMD | ✅ Full Linux environment |
| ✅ Great for most projects | ✅ Matches production servers |
| ✅ .NET, C#, Windows apps | ✅ Bash scripts, make, etc. |

**Recommendation:** Start with Native Windows. It's simpler and works for most use cases. Switch to WSL later if you need Unix-specific tooling.

---

## Option A: Native Windows Setup (Recommended)

The fastest way to get started - no Linux required!

### Step 1: Install Node.js

Download and install from [nodejs.org](https://nodejs.org) (choose the LTS version).

Or use winget in PowerShell:

```powershell
winget install OpenJS.NodeJS.LTS
```

Verify installation:

```powershell
node --version  # Should show v20.x.x or higher
npm --version   # Should show 10.x.x
```

### Step 2: Install Claude Code

```powershell
npm install -g @anthropic-ai/claude-code
```

Verify:

```powershell
claude --version
```

### Step 3: Set Your API Key

For the current session:

```powershell
$env:ANTHROPIC_API_KEY = "sk-ant-xxxxx"
```

To make it permanent, add to System Environment Variables:
1. Press `Win + R`, type `sysdm.cpl`, press Enter
2. Go to Advanced → Environment Variables
3. Under User Variables, click New
4. Name: `ANTHROPIC_API_KEY`, Value: `sk-ant-xxxxx`

Or add to your PowerShell profile:

```powershell
notepad $PROFILE
# Add this line:
$env:ANTHROPIC_API_KEY = "sk-ant-xxxxx"
```

### Step 4: Run Claude Code!

```powershell
cd C:\Users\YourName\Projects\my-app
claude
```

**That's it!** You're ready to go. Skip ahead to "Pro Tips" below.

---

## Option B: WSL Setup (For Unix Tools)

Use this if you need bash scripts, make, grep, or Linux-specific tooling.

### Step 1: Install WSL

Open **PowerShell as Administrator** and run:

```powershell
wsl --install
```

This installs WSL 2 with Ubuntu by default. Restart your computer when prompted.

### Step 2: Set Up Ubuntu

After restart, Ubuntu will launch automatically (or search for "Ubuntu" in Start menu).

Create a username and password:

```bash
Enter new UNIX username: yourname
New password: ********
```

Update packages:

```bash
sudo apt update && sudo apt upgrade -y
```

### Step 3: Install Node.js (via NVM)

NVM lets you easily switch between Node versions:

```bash
# Install NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Reload shell
source ~/.bashrc

# Install Node.js 20 (LTS)
nvm install 20

# Verify installation
node --version  # Should show v20.x.x
```

### Step 4: Install Claude Code

```bash
npm install -g @anthropic-ai/claude-code
```

Verify:

```bash
claude --version
```

### Step 5: Set Your API Key

```bash
export ANTHROPIC_API_KEY="sk-ant-xxxxx"
echo 'export ANTHROPIC_API_KEY="sk-ant-xxxxx"' >> ~/.bashrc
```

### Step 6: Run Claude Code!

```bash
# Access Windows files from WSL
cd /mnt/c/Users/YourName/Projects/my-app
claude
```

---

## Authentication Options

### API Key (Pay-per-use)

Get your API key from [console.anthropic.com](https://console.anthropic.com)

### Claude Pro/Max Subscription

If you have a Claude Pro or Max subscription, authenticate via browser:

```bash
claude auth login
```

This opens a browser window to authenticate with your Anthropic account.

---

## First Run

You'll see Claude's interface:

```
╭─────────────────────────────────────────────╮
│ Claude Code                                  │
│ Your AI pair programmer                      │
╰─────────────────────────────────────────────╯

> What would you like to do?
```

You'll see Claude's interface:

```
╭─────────────────────────────────────────────╮
│ Claude Code                                  │
│ Your AI pair programmer                      │
╰─────────────────────────────────────────────╯

> What would you like to do?
```

### Try Some Commands

```
> Can you explain what this project does?

> Create a new React component called Header

> Fix the bug in src/utils.js where the function returns undefined

> Run the tests and fix any failures
```

---

## Part 6: Windows Terminal Setup (Optional but Recommended)

For the best experience, use Windows Terminal with a nice configuration:

### Install Windows Terminal

```powershell
# In PowerShell
winget install Microsoft.WindowsTerminal
```

### Set WSL as Default Profile

1. Open Windows Terminal
2. Click the dropdown arrow → Settings
3. Set "Default profile" to "Ubuntu"
4. Save

### Pro Tip: Add Claude Alias

Add this to your `~/.bashrc` for quick access:

```bash
# Quick project navigation + Claude
alias dev='cd /mnt/c/Users/YourName/Projects && claude'

# Claude in current directory
alias c='claude'
```

Reload with `source ~/.bashrc`

---

## Part 7: VS Code Integration

If you use VS Code, you can integrate it with WSL:

### Install Remote - WSL Extension

1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X)
3. Search "Remote - WSL"
4. Install it

### Open Projects in WSL

```bash
# From WSL terminal
code .
```

This opens VS Code connected to your WSL environment. Now you can:
- Edit files in VS Code
- Run Claude Code in the integrated terminal
- Best of both worlds!

---

## Troubleshooting

### "Command not found: claude"

```bash
# Check if npm bin is in PATH
echo $PATH | grep npm

# If not, add it:
export PATH="$PATH:$(npm bin -g)"
```

### "Permission denied"

```bash
# Fix npm permissions
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc

# Reinstall Claude Code
npm install -g @anthropic-ai/claude-code
```

### "API key not found"

```bash
# Make sure it's exported
echo $ANTHROPIC_API_KEY

# If empty, set it again
export ANTHROPIC_API_KEY="sk-ant-xxxxx"
```

### WSL is Slow

```bash
# Don't run from /mnt/c (Windows filesystem)
# Instead, clone projects to Linux home:
cd ~
git clone your-repo
cd your-repo
claude
```

Linux filesystem is much faster than mounted Windows drives.

---

## Pro Tips

### 1. Use Claude for Git Operations

```
> Review my changes and write a commit message
> Create a PR description for the current branch
> Explain what changed in the last 5 commits
```

### 2. Let Claude Run Commands

Claude can run terminal commands for you. Just confirm when prompted:

```
> Run the test suite and fix any failures
> Install the dependencies and start the dev server
> Deploy this to production
```

### 3. Context is Everything

The more Claude knows about your project, the better:

```
> Read the README and understand this project
> Look at the folder structure and explain the architecture
> What patterns are used in this codebase?
```

### 4. Be Specific

Instead of:
```
> Fix the bug
```

Try:
```
> The login form isn't validating email addresses. Users can submit without @ symbol. Fix this in src/components/LoginForm.tsx
```

---

## Cost Considerations

### API Key Pricing

- Claude 3.5 Sonnet: ~$3 per million input tokens, ~$15 per million output tokens
- Average coding session: $0.10 - $1.00 depending on complexity

### Subscription Option

- Claude Pro ($20/month): Includes Claude Code usage
- Claude Max ($100/month): Higher limits for power users

---

## What Can You Build?

With Claude Code, you can:

- 🚀 **Scaffold entire applications** from a description
- 🐛 **Debug issues** by letting Claude read error logs
- 📝 **Write documentation** based on your code
- 🧪 **Generate tests** for existing functions
- 🔄 **Refactor code** while maintaining functionality
- 📊 **Analyze codebases** you're unfamiliar with

---

## Summary

Here's the quick version:

```bash
# 1. Install WSL
wsl --install
# (restart computer)

# 2. Install Node.js
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 20

# 3. Install Claude Code
npm install -g @anthropic-ai/claude-code

# 4. Set API Key
export ANTHROPIC_API_KEY="sk-ant-xxxxx"
echo 'export ANTHROPIC_API_KEY="sk-ant-xxxxx"' >> ~/.bashrc

# 5. Run it!
cd /mnt/c/Users/YourName/Projects/my-app
claude
```

---

## Links

- [Claude Code Documentation](https://docs.anthropic.com/claude-code)
- [Anthropic Console (API Keys)](https://console.anthropic.com)
- [WSL Documentation](https://docs.microsoft.com/en-us/windows/wsl/)
- [Node.js Downloads](https://nodejs.org)

---

*Happy coding! 🎉*

*Have questions? Hit me up on Twitter [@JoePro](https://twitter.com/JoePro)*

---

**Tags:** #ClaudeCode #AI #Windows #WSL #CodingTools #DeveloperTools #Anthropic #Tutorial
