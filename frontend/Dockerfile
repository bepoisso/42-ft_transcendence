FROM node:20 as build

WORKDIR /app
	
COPY package*.json ./

RUN npm install

# Copier les fichiers source
COPY . .

RUN npm run build

FROM nginx:latest

COPY ./nginx/nginx.conf /etc/nginx/nginx.conf

# Copy all built files from the build stage
COPY --from=build /app/dist/ /app/dist/

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
