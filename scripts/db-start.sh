#!/usr/bin/env bash
set -euo pipefail

DB_DIR="$HOME/.monadaty-pg"
SOCK_DIR="$HOME/.monadaty-pg-sock"
PG_PORT=5432
PG_HOST=127.0.0.1

mkdir -p "$DB_DIR" "$SOCK_DIR"

check_port() {
  nc -z "$PG_HOST" "$PG_PORT" 2>/dev/null
}

if check_port; then
  echo "PostgreSQL is already running on $PG_HOST:$PG_PORT"
  exit 0
fi

PIDFILE="$DB_DIR/pglite.pid"
if [ -f "$PIDFILE" ]; then
  PID=$(cat "$PIDFILE")
  if kill -0 "$PID" 2>/dev/null; then
    echo "pglite-server is running (PID: $PID) but not accepting connections. Stopping..."
    kill "$PID" 2>/dev/null || true
    sleep 1
  fi
  rm -f "$PIDFILE"
fi

echo "Starting pglite-server on $PG_HOST:$PG_PORT..."
cd "$(dirname "$0")/.."
npx pglite-server \
  -d "$DB_DIR/data.db" \
  -p "$PG_PORT" \
  -h "$PG_HOST" \
  -m 5 \
  > "$DB_DIR/server.log" 2>&1 &

echo $! > "$PIDFILE"

for i in $(seq 1 30); do
  if check_port; then
    echo "postgres ready (port $PG_PORT)"
    exit 0
  fi
  if ! kill -0 "$(cat "$PIDFILE")" 2>/dev/null; then
    echo "ERROR: pglite-server exited unexpectedly. Check $DB_DIR/server.log"
    cat "$DB_DIR/server.log" >&2
    rm -f "$PIDFILE"
    exit 1
  fi
  sleep 0.5
done

echo "ERROR: pglite-server did not become ready within 15 seconds"
cat "$DB_DIR/server.log" >&2
rm -f "$PIDFILE"
exit 1
