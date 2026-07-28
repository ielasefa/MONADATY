#!/usr/bin/env bash
set -euo pipefail

DB_DIR="$HOME/.monadaty-pg"
PIDFILE="$DB_DIR/pglite.pid"

if [ -f "$PIDFILE" ]; then
  PID=$(cat "$PIDFILE")
  if kill -0 "$PID" 2>/dev/null; then
    echo "Stopping pglite-server (PID: $PID)..."
    kill "$PID"
    for i in $(seq 1 10); do
      if ! kill -0 "$PID" 2>/dev/null; then
        echo "pglite-server stopped"
        rm -f "$PIDFILE"
        exit 0
      fi
      sleep 0.5
    done
    echo "pglite-server did not stop gracefully, forcing..."
    kill -9 "$PID" 2>/dev/null || true
    rm -f "$PIDFILE"
    exit 0
  fi
  rm -f "$PIDFILE"
  echo "pglite-server was not running"
else
  echo "No pglite PID file found"
  pkill -f "pglite-server" 2>/dev/null || true
fi
