#!/bin/bash

# System Initialization Script
# Prepares the environment for autonomous operation

echo "🚀 Initializing Multi-Agent Development System..."

AGENT_DIR="$(pwd)/agent-coordination"
WORKFLOW_DIR="$(pwd)/workflow"

# Function to create directory if it doesn't exist
ensure_dir() {
    if [ ! -d "$1" ]; then
        mkdir -p "$1"
        echo "✅ Created $1"
    fi
}

# Function to create file if it doesn't exist
ensure_file() {
    if [ ! -f "$1" ]; then
        echo "$2" > "$1"
        echo "✅ Created $1"
    fi
}

echo ""
echo "📁 Verifying directory structure..."

# Ensure all directories exist
ensure_dir "$AGENT_DIR/knowledge/patterns"
ensure_dir "$AGENT_DIR/knowledge/decisions"
ensure_dir "$AGENT_DIR/knowledge/errors"
ensure_dir "$AGENT_DIR/archives"

# Ensure agent directories
for agent in orchestrator impl-1 impl-2 impl-3 auditor doc-guardian test-sentinel visual-qa; do
    ensure_dir "$AGENT_DIR/agents/$agent/inbox"
    ensure_dir "$AGENT_DIR/agents/$agent/outbox"
    ensure_dir "$AGENT_DIR/agents/$agent/status"
done

echo ""
echo "📄 Initializing configuration files..."

# Initialize system metrics
ensure_file "$AGENT_DIR/orchestrator/metrics.json" '{
  "initialized_at": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'",
  "tasks_completed": 0,
  "patterns_created": 2,
  "decisions_logged": 1,
  "coverage_start": 79.14,
  "coverage_current": 79.14,
  "system_version": "2.0.0"
}'

# Initialize pattern index
ensure_file "$AGENT_DIR/knowledge/patterns/index.json" '{
  "patterns": [
    {
      "id": "search-input",
      "name": "Search Input with Debounce",
      "file": "pattern-search-input.json",
      "usage_count": 5
    }
  ],
  "total_patterns": 1,
  "last_updated": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'"
}'

# Initialize error patterns
ensure_file "$AGENT_DIR/knowledge/errors/common-errors.json" '{
  "errors": [
    {
      "pattern": "Cannot find module",
      "solution": "Check import paths and tsconfig aliases",
      "frequency": 0
    },
    {
      "pattern": "Type .* is not assignable",
      "solution": "Verify type definitions match usage",
      "frequency": 0
    }
  ]
}'

echo ""
echo "🔍 Checking prerequisites..."

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo "❌ npm not found. Please install Node.js"
    exit 1
fi

# Check if git is available
if ! command -v git &> /dev/null; then
    echo "❌ git not found. Please install git"
    exit 1
fi

# Check if on main branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo "⚠️  Warning: Not on main branch (currently on $CURRENT_BRANCH)"
    echo "   Agents will merge to main branch"
fi

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo "⚠️  Warning: Uncommitted changes detected"
    echo "   Consider committing before starting agents"
fi

echo ""
echo "📊 System Status Check..."

# Run tests to get current status (with timeout to prevent hanging)
echo "Running tests to check coverage (30 second timeout)..."
timeout 30 npm test -- --run --coverage &> /dev/null
TEST_RESULT=$?
if [ $TEST_RESULT -eq 0 ]; then
    echo "✅ Tests passing"
elif [ $TEST_RESULT -eq 124 ]; then
    echo "⚠️  Test check timed out - skipping coverage check"
else
    echo "⚠️  Some tests failing - agents will prioritize fixes"
fi

# Check if dev server is running
if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null ; then
    echo "✅ Dev server running on port 5173"
else
    echo "⚠️  Dev server not running - start with 'npm run dev'"
fi

echo ""
echo "🎯 Task Preparation..."

# Count available tasks
if [ -f "$WORKFLOW_DIR/ATOMIC-TASKS.json" ]; then
    # In real implementation, use jq to count tasks
    echo "✅ Atomic tasks ready for assignment"
else
    echo "⚠️  No atomic tasks found - orchestrator will decompose from TASK-MANIFEST.json"
fi

echo ""
echo "✨ Initialization complete!"
echo ""
echo "📋 Next steps:"
echo "1. Run ./start-agents.sh to launch all agents"
echo "2. Run ./monitor-agents.sh in another terminal to monitor"
echo "3. Agents will begin working autonomously"
echo ""
echo "🔍 To verify system health:"
echo "- Check agent heartbeats: ls -la $AGENT_DIR/heartbeats/"
echo "- View task assignments: cat $AGENT_DIR/orchestrator/task-assignments.json"
echo "- Monitor coverage: npm run test:coverage"
echo ""
echo "Ready for autonomous operation! 🚀"