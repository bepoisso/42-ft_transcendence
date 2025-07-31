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

logs:
	docker compose logs -f

re: down fclean build up

.PHONY: build up down clean fclean logs
