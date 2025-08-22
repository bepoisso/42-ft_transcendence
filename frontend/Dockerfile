FROM debian:latest

RUN apt-get update && \
	apt-get install -y \
	build-essential \
	git \
	curl \
	vim && \
	rm -rf /var/lib/apt/lists/*

RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
RUN bash "$HOME/.nvm/nvm.sh"
RUN nvm install 22


RUN mkdir -p /bdd

RUN mkdir -p /etc/frontend
COPY ../frontend /etc/frontend

CMD ["tail", "-f", "/dev/null"]
