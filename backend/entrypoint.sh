#!/bin/bash

DB_FILE="/app/back.db"
if [ ! -f "$DB_FILE" ]; then
	# sqlite3 "$DB_FILE" "VACUUM;"
	sqlite3 "$DB_FILE" < /tmp/init.sql && rm /tmp/init.sql+32
   	echo "Database '$DB_FILE' created in /app."
el< <se
	e0.
<	
	.cho "Database '$DB_FILE' already exists in /app."
fi

tail -f /dev/null
