build:
	docker compose build

up:
	docker compose up -d

down:
	docker compose down

clean: down
	docker rmi $(docker images -q)

fclean: clean
	docker system prune -f

.PHONY: build up down clean fclean
