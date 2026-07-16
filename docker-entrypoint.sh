#!/bin/sh
set -e

DB_PATH="/usr/src/app/db.sqlite"

if [ -d "$DB_PATH" ]; then
	echo "[whatsapp-dev] $DB_PATH is a directory — replacing with an empty SQLite file"
	rm -rf "$DB_PATH"
	touch "$DB_PATH"
elif [ ! -e "$DB_PATH" ]; then
	echo "[whatsapp-dev] creating empty $DB_PATH"
	touch "$DB_PATH"
fi

exec /usr/bin/app "$@"
