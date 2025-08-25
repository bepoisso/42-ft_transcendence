all: build up

build:
	docker compose build

up:
	docker compose up -d

down:
	docker compose down

clean: down
	docker system prune -f

fclean: clean
	docker system prune -a -f --volumes
	rm -rf ./backend/app

logs:
	docker compose logs -f

restart: down build up

re: down build up

.PHONY: build up down clean fclean logs
