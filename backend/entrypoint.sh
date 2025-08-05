#!/bin/bash

DB_FILE="/bdd/back.db"

if [ ! -f "$DB_FILE" ]; then
	# Création de la base de données à partir du script SQL
	sqlite3 "$DB_FILE" < /tmp/init.sql && rm /tmp/init.sql
	echo "✅ Database '$DB_FILE' created in /bdd."
else
	echo "ℹ️ Database '$DB_FILE' already exists in /bdd."
fi

# Démarrage du serveur Nginx
nginx -g 'daemon off;'


# Garde le conteneur actif
tail -f /dev/null
