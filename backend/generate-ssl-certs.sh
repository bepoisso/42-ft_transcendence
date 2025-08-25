#!/bin/bash

# Créer le dossier certs s'il n'existe pas
mkdir -p certs

# Générer une clé privée
openssl genrsa -out certs/server-key.pem 2048

# Générer un certificat auto-signé
openssl req -new -x509 -key certs/server-key.pem -out certs/server-cert.pem -days 365 -subj "/C=FR/ST=Paris/L=Paris/O=42School/OU=IT Department/CN=localhost"

# Définir les permissions appropriées
chmod 400 certs/server-key.pem
chmod 444 certs/server-cert.pem

echo "Certificats SSL générés avec succès !"
echo "Clé privée: certs/server-key.pem"
echo "Certificat: certs/server-cert.pem"
