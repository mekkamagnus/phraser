#!/bin/bash
# Start Ralph in a new tmux window
# Usage: ./start-ralph.sh [max_iterations]

set -e

SESSION_NAME="phraser"
WINDOW_NAME="ralph-loop"
MAX_ITERATIONS=${1:-10}

# Check if tmux session exists
if ! tmux has-session -t "$SESSION_NAME" 2>/dev/null; then
  echo "Error: Tmux session '$SESSION_NAME' does not exist."
  echo "Please create it first with: tmux new-session -s $SESSION_NAME"
  exit 1
fi

# Check if window already exists
if tmux list-windows -t "$SESSION_NAME" -F "#{window_name}" | grep -q "^$WINDOW_NAME$"; then
  echo "Warning: Window '$WINDOW_NAME' already exists in session '$SESSION_NAME'."
  echo "Killing existing window..."
  tmux kill-window -t "$SESSION_NAME:$WINDOW_NAME" 2>/dev/null || true
  sleep 1
fi

# Get the script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

echo "Starting Ralph in tmux..."
echo "Session: $SESSION_NAME"
echo "Window: $WINDOW_NAME"
echo "Max iterations: $MAX_ITERATIONS"
echo ""

# Create new window and run Ralph
tmux new-window -t "$SESSION_NAME" -n "$WINDOW_NAME" -c "$PROJECT_ROOT"

# Send the command to run Ralph
tmux send-keys -t "$SESSION_NAME:$WINDOW_NAME" "./scripts/ralph/ralph.sh $MAX_ITERATIONS" C-m

echo "Ralph is now running in tmux window '$WINDOW_NAME' of session '$SESSION_NAME'."
echo ""
echo "To attach to the session:"
echo "  tmux attach-session -t $SESSION_NAME"
echo ""
echo "To switch to the Ralph window (if already attached):"
echo "  Prefix + w (then select $WINDOW_NAME)"
echo "  or: Prefix + :select-window -t $WINDOW_NAME"
echo ""
echo "To kill the Ralph window:"
echo "  tmux kill-window -t $SESSION_NAME:$WINDOW_NAME"
