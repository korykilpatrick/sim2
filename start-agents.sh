#!/bin/bash

# Multi-Agent Development System Launcher v2.0
# Autonomous system with initialization

echo "🚀 Starting Multi-Agent Development System v2.0..."
echo ""

# Get the current directory
WORKING_DIR=$(pwd)

# Run initialization first
echo "📋 Running system initialization..."
./agent-coordination/initialize-system.sh
if [ $? -ne 0 ]; then
    echo "❌ Initialization failed. Please fix issues and try again."
    exit 1
fi

echo ""
echo "🔄 Launching agents..."
echo ""

# Check if iTerm2 is running
if ! pgrep -x "iTerm2" > /dev/null; then
    echo "Starting iTerm2..."
    open -a iTerm
    sleep 2
fi

# Function to create a new iTerm2 tab and run command
create_tab() {
    local tab_name=$1
    local command=$2
    
    osascript -e "
    tell application \"iTerm\"
        tell current window
            create tab with default profile
            tell current session
                set name to \"$tab_name\"
                write text \"cd $WORKING_DIR\"
                write text \"$command\"
            end tell
        end tell
    end tell
    "
}

# Launch the Monitor first (so we can see system status)
echo "📊 Starting System Monitor..."
create_tab "Monitor" "./monitor-agents.sh"
sleep 1

# Launch the Orchestrator (the brain)
echo "🧠 Starting Planning Orchestrator..."
create_tab "Orchestrator" "echo '🧠 Orchestrator starting...' && echo 'Reading system state and task manifest...' && echo '' && claude --no-conversation-file code . --prompt-file agent-coordination/prompts/ORCHESTRATOR.md --system 'You are the Planning Orchestrator. Start by reading ATOMIC-TASKS.json and begin your 10-second work loop immediately.'"
sleep 2

# Launch Implementation Agents
echo "💻 Starting Implementation Agent 1..."
create_tab "Impl-1" "echo '💻 Implementation Agent 1 starting...' && echo 'Waiting for task assignments...' && echo '' && claude --no-conversation-file code . --prompt-file agent-coordination/prompts/IMPLEMENTATION.md --system 'You are Implementation Agent 1 (impl-1). Check your inbox at /agent-coordination/agents/impl-1/inbox/ every 30 seconds for tasks.'"
sleep 1

echo "💻 Starting Implementation Agent 2..."
create_tab "Impl-2" "echo '💻 Implementation Agent 2 starting...' && echo 'Waiting for task assignments...' && echo '' && claude --no-conversation-file code . --prompt-file agent-coordination/prompts/IMPLEMENTATION.md --system 'You are Implementation Agent 2 (impl-2). Check your inbox at /agent-coordination/agents/impl-2/inbox/ every 30 seconds for tasks.'"
sleep 1

echo "💻 Starting Implementation Agent 3..."
create_tab "Impl-3" "echo '💻 Implementation Agent 3 starting...' && echo 'Waiting for task assignments...' && echo '' && claude --no-conversation-file code . --prompt-file agent-coordination/prompts/IMPLEMENTATION.md --system 'You are Implementation Agent 3 (impl-3). Check your inbox at /agent-coordination/agents/impl-3/inbox/ every 30 seconds for tasks.'"
sleep 1

# Launch Analysis Auditor
echo "🔍 Starting Analysis Auditor..."
create_tab "Auditor" "echo '🔍 Analysis Auditor starting...' && echo 'Beginning 8-pass code analysis...' && echo '' && claude --no-conversation-file code . --prompt-file agent-coordination/prompts/AUDITOR.md --system 'You are the Analysis Auditor. Start your continuous analysis loop, prioritizing recently changed files.'"
sleep 1

# Launch Documentation Guardian
echo "📚 Starting Documentation Guardian..."
create_tab "Doc-Guardian" "echo '📚 Documentation Guardian starting...' && echo 'Mapping code to documentation...' && echo '' && claude --no-conversation-file code . --prompt-file agent-coordination/prompts/DOC-GUARDIAN.md --system 'You are the Documentation Guardian. Begin verifying code-documentation alignment.'"
sleep 1

# Launch Test Coverage Sentinel
echo "🛡️ Starting Test Coverage Sentinel..."
create_tab "Test-Sentinel" "echo '🛡️ Test Coverage Sentinel starting...' && echo 'Monitoring test coverage...' && echo '' && claude --no-conversation-file code . --prompt-file agent-coordination/prompts/TEST-SENTINEL.md --system 'You are the Test Coverage Sentinel. Begin monitoring coverage and block any drops.'"
sleep 1

# Launch Visual QA Agent
echo "👁️ Starting Visual QA Agent..."
create_tab "Visual-QA" "echo '👁️ Visual QA Agent starting...' && echo 'Preparing Puppeteer for visual testing...' && echo '' && claude --no-conversation-file code . --prompt-file agent-coordination/prompts/VISUAL-QA.md --system 'You are the Visual QA Agent. Begin visual testing of UI components using Puppeteer.'"
sleep 1

# Final message
echo "
✅ All agents launched successfully!

The system is now operating autonomously.

🎯 Initial Focus:
- Phase 0: Security hardening tasks
- Atomic task decomposition active
- Pattern learning enabled
- Quality gates enforced

📊 Monitoring:
- System Monitor running in first tab
- Check agent health and task progress
- View real-time metrics and activity

🛑 To stop all agents: ./stop-agents.sh

⚡ The agents will now:
1. Read the task manifest
2. Decompose large tasks into atomic units
3. Assign tasks based on priority
4. Write tests first, then implement
5. Maintain and improve code quality
6. Learn from patterns and decisions

No human intervention needed unless critical failures occur.
"

# Keep the script running to show the status
sleep 5
echo "🟢 System initialization complete. Autonomous operation active."