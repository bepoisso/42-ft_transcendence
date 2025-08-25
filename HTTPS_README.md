# Configuration HTTPS

Ce projet utilise maintenant HTTPS pour sécuriser les communications entre le frontend et le backend.

## Certificats SSL

Les certificats SSL sont générés automatiquement et stockés dans `backend/certs/`.

### Regénérer les certificats

Si vous devez regénérer les certificats :

```bash
cd backend
./generate-ssl-certs.sh
```

## Démarrage des serveurs

### Backend (HTTPS sur le port 3000)
```bash
cd backend
npm run dev
```

### Frontend (HTTPS sur le port 5173)
```bash
cd frontend
npm run dev
```

## Accès aux services

- **Frontend**: https://localhost:5173
- **Backend API**: https://localhost:3000

## Note importante

Les certificats sont auto-signés, donc votre navigateur affichera un avertissement de sécurité la première fois. Vous pouvez accepter le certificat pour continuer.

## Variables d'environnement

Assurez-vous de créer un fichier `.env` dans le dossier backend basé sur `.env.example` et de définir :

```env
ADRESS=https://localhost
PORT_BACK=3000
PORT_FRONT=5173
```
