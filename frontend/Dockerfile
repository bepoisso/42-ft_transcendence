FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm install

# Installer http-server globalement pour servir les fichiers statiques
RUN npm install -g http-server

# Copier les fichiers source
COPY . .

# Compiler TypeScript
RUN npx tsc

# Build Tailwind CSS
RUN npx tailwindcss -i ./src/style.css -o ./dist/style.css --minify

# Copier index.html et assets dans le dossier dist
RUN cp index.html dist/
RUN cp -r assets dist/

EXPOSE 5173

# Servir les fichiers statiques avec http-server
CMD ["http-server", "dist", "-p", "5173", "-c-1"]
