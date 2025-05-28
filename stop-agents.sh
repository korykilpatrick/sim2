#!/bin/bash

# Multi-Agent Development System Shutdown Script
# Gracefully stops all running agents

echo "🛑 Stopping Multi-Agent Development System..."

# Get the current directory
WORKING_DIR=$(pwd)
AGENT_DIR="$WORKING_DIR/agent-coordination"

# Function to send shutdown signal to agents
send_shutdown_signal() {
    local shutdown_file="$AGENT_DIR/events/shutdown-$(date +%s).json"
    cat > "$shutdown_file" << EOF
{
  "type": "system-shutdown",
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "message": "Graceful shutdown requested",
  "requested_by": "stop-agents.sh"
}
EOF
    echo "📤 Shutdown signal sent"
}

# Function to close iTerm2 tabs by name
close_tab() {
    local tab_name=$1
    
    osascript -e "
    tell application \"iTerm\"
        tell current window
            repeat with aTab in tabs
                tell aTab
                    repeat with aSession in sessions
                        tell aSession
                            if name contains \"$tab_name\" then
                                close
                            end if
                        end tell
                    end repeat
                end tell
            end repeat
        end tell
    end tell
    " 2>/dev/null
}

# Send shutdown signal first
echo "📡 Sending shutdown signal to all agents..."
send_shutdown_signal
sleep 2

# Close agent tabs
echo "🔄 Closing agent tabs..."
close_tab "Orchestrator"
close_tab "Impl-1"
close_tab "Impl-2"
close_tab "Impl-3"
close_tab "Auditor"
close_tab "Doc-Guardian"
close_tab "Test-Sentinel"
close_tab "Visual-QA"
close_tab "Monitor"

# Clean up any stale locks
echo "🧹 Cleaning up locks..."
rm -f "$AGENT_DIR/locks/files/"*.lock 2>/dev/null

# Archive current run data
echo "📦 Archiving run data..."
ARCHIVE_DIR="$AGENT_DIR/archives/run-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$ARCHIVE_DIR"

# Move relevant files to archive
if [ -d "$AGENT_DIR/heartbeats" ]; then
    cp -r "$AGENT_DIR/heartbeats" "$ARCHIVE_DIR/" 2>/dev/null
fi

if [ -f "$WORKING_DIR/workflow/TASK-MANIFEST.json" ]; then
    cp "$WORKING_DIR/workflow/TASK-MANIFEST.json" "$ARCHIVE_DIR/" 2>/dev/null
fi

# Clear runtime directories
echo "🗑️ Clearing runtime data..."
rm -f "$AGENT_DIR/heartbeats/"*.json 2>/dev/null
rm -f "$AGENT_DIR/agents/*/inbox/"*.json 2>/dev/null
rm -f "$AGENT_DIR/agents/*/outbox/"*.json 2>/dev/null
rm -f "$AGENT_DIR/events/"*.json 2>/dev/null

# Final message
echo "
✅ All agents stopped successfully!

Runtime data archived to:
$ARCHIVE_DIR

The system is now shut down.
To restart, run: ./start-agents.sh
"