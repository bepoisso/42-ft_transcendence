FROM debian:latest

RUN apt-get update && \
	apt-get install -y \
	build-essential \
	git \
	curl \
	vim && \
	rm -rf /var/lib/apt/lists/*

CMD ["tail", "-f", "/dev/null"]
