FROM debian:latest

RUN apt-get update && \
	apt-get install -y \
	build-essential \
	git \
	curl \
	vim \
	nginx \
	openssl \
	sqlite3 && \
	rm -rf /var/lib/apt/lists/*

RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
RUN bash "$HOME/.nvm/nvm.sh"
RUN nvm install 22

RUN mkdir -p /bdd

COPY entrypoint.sh /tmp/entrypoint.sh
RUN chmod +x /tmp/entrypoint.sh

COPY ./init.sql /tmp/init.sql

COPY nginx.conf /etc/nginx/nginx.conf

RUN mkdir -p /etc/backend
COPY ../backend /etc/backend

EXPOSE 443
EXPOSE 80
EXPOSE 3000


ENTRYPOINT ["/tmp/entrypoint.sh"]
