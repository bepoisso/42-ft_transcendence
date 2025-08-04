#!/bin/bash

DB_FILE="/app/back.db"
if [ ! -f "$DB_FILE" ]; then
	sqlite3 "$DB_FILE" "VACUUM;"
	echo "Database '$DB_FILE' created in /app."
else
	echo "Database '$DB_FILE' already exists in /app."
fi

tail -f /dev/null
