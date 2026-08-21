#!/usr/bin/env bash
set -euo pipefail

local_database_url="${LOCAL_DATABASE_URL:-postgresql://postgres@127.0.0.1:5432/monadaty?sslmode=disable}"

database_host="$(node -e '
  const value = process.argv[1];
  let parsed;
  try { parsed = new URL(value); } catch { process.exit(2); }
  process.stdout.write(parsed.hostname);
' "$local_database_url")"

case "$database_host" in
  localhost|127.0.0.1|::1) ;;
  *)
    echo "ERROR: Refusing local database command for non-loopback host: $database_host" >&2
    exit 1
    ;;
esac

export DATABASE_URL="$local_database_url"
exec "$@"
