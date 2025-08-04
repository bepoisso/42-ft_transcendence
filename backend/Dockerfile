FROM debian:latest

RUN apt-get update && \
	apt-get install -y \
	build-essential \
	git \
	curl \
	vim \
	sqlite3 && \
	rm -rf /var/lib/apt/lists/*

RUN mkdir -p /app

COPY entrypoint.sh /tmp/entrypoint.sh
RUN chmod +x /tmp/entrypoint.sh

COPY ./init.sql /tmp/init.sql

ENTRYPOINT ["/tmp/entrypoint.sh"]
