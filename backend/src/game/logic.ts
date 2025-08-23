import { GameRoom, Player, Paddle, Ball, HEIGHT, WIDTH } from "./interface";
import { game_over } from "./socket";

export function updateGame(gameRoom: GameRoom, fromID: number | undefined, direction: string, movement: string, perspective?: string) : void {
	let currentPlayer: Player;
	if (perspective === "player1") {
		currentPlayer = gameRoom.gameState.player1;
	} else if (perspective === "player2") {
		currentPlayer = gameRoom.gameState.player2;
	} else {
		// Fallback to old method
		currentPlayer = gameRoom.player1.id_player == fromID ? gameRoom.gameState.player1 : gameRoom.gameState.player2;
	}

	if (movement == "start") {
		if (direction == "up" || direction == "UP")
			currentPlayer.key_pressed = "UP";
		else if (direction == "down" || direction == "DOWN")
			currentPlayer.key_pressed = "DOWN";
	}
	else if (movement == "stop")
		currentPlayer.key_pressed = "";
}

export function gameLoop(gameRoom: GameRoom): void {
	const player1 = gameRoom.gameState.player1;
	const player2 = gameRoom.gameState.player2;
	const paddle1 = player1.paddle;
	const paddle2 = player2.paddle;
	const ball = gameRoom.gameState.ball;

	// handle player input and move paddles
	handleInput(player1, player2, paddle1, paddle2);

	// update ball pos
	const scoreResult = updateBall(player1, player2, paddle1, paddle2, ball);

	// update score
	if (scoreResult === 1)
		player1.score++;
	else if (scoreResult === 2)
		player2.score++;

	// check if game end (max score)
	const MAX_SCORE = 10;
	if (player1.score >= MAX_SCORE || player2.score >= MAX_SCORE) {
		gameRoom.gameState.is_running = false;
		clearInterval((gameRoom as any).interval);

		// send end msg to all players
		const winner = player1.score >= MAX_SCORE ? player1.username : player2.username;
		const sockets = (gameRoom as any).sockets || [];
		const endMessage = JSON.stringify({
			type: "game_over",
			winner: winner,
			player1Score: player1.score,
			player2Score: player2.score
		});

		sockets.forEach((sock: WebSocket | undefined) => {
			if (sock && sock.readyState === 1) {
				sock.send(endMessage);
			}
		});

		game_over(gameRoom);
	}
}

function handleInput(player1: Player, player2: Player, paddle1: Paddle, paddle2: Paddle): void {
	// player 1
	if (player1.key_pressed == "up" || player1.key_pressed == "UP")
		paddle1.y = Math.max(0, paddle1.y - paddle1.speed);
	else if (player1.key_pressed == "down" || player1.key_pressed == "DOWN")
		paddle1.y = Math.min(HEIGHT - paddle1.height, paddle1.y + paddle1.speed);

	// player 2
	if (player2.key_pressed == "up" || player2.key_pressed == "UP")
		paddle2.y = Math.max(0, paddle2.y - paddle2.speed);
	else if (player2.key_pressed == "down" || player2.key_pressed == "DOWN")
		paddle2.y = Math.min(HEIGHT - paddle2.height, paddle2.y + paddle2.speed);
}

function updateBall(player1: Player, player2: Player, paddle1: Paddle, paddle2: Paddle, ball: Ball): number {
	// ball movment
	ball.x += ball.xDirect;
	ball.y += ball.yDirect;

	// up + down canvas collision
	if (ball.y + ball.radius > HEIGHT || ball.y - ball.radius < 0)
		ball.yDirect = -ball.yDirect;

	// wich player have the ball
	let player = ball.x < WIDTH / 2 ? 1 : 2;

	// with wich paddle collisionate
	let paddle = player === 1 ? paddle1 : paddle2;

	// check paddle collision
	if (ballCollideWithPaddle(paddle, ball)) {
		// collision point
		let collidePoint = ball.y - (paddle.y + paddle.height / 2);

		// normalisation collision point
		collidePoint = collidePoint / (paddle.height / 2);

		// rebound angle calculation
		let angleRad;
		if (Math.abs(collidePoint) < 0.1) // center of paddle
			angleRad = (Math.random() - 0.5) * Math.PI / 8; // random angle
		else
			angleRad = (Math.PI / 4) * collidePoint; // angle based on collision point

		// ball direction depending on player
		let direction = player === 1 ? 1 : -1;

		// change velocity X & Y
		ball.xDirect = direction * ball.speed * Math.cos(angleRad);
		ball.yDirect = ball.speed * Math.sin(angleRad);

		// increase speed at each collision
		ball.speed *= 1.2;
	}

	// check if point scored and reset the ball
	if (ball.x - ball.radius < 0) {
		resetBall(ball);
		return 2; // J2 score
	} else if (ball.x + ball.radius > WIDTH) {
		resetBall(ball);
		return 1; // J1 score
	}

	return 0; // no points scored
}

function ballCollideWithPaddle(paddle: Paddle, ball: Ball): boolean {
	let paddleTop = paddle.y;
	let paddleBottom = paddle.y + paddle.height;
	let paddleLeft = paddle.x;
	let paddleRight = paddle.x + paddle.width;

	return (
		ball.x + ball.radius > paddleLeft &&
		ball.x - ball.radius < paddleRight &&
		ball.y + ball.radius > paddleTop &&
		ball.y - ball.radius < paddleBottom
	);
}

function resetBall(ball: Ball): void {
	ball.x = WIDTH / 2;
	ball.y = HEIGHT / 2;
	ball.speed = 5;
	ball.xDirect = ball.xDirect = ball.xDirect > 0 ? -ball.speed : ball.speed;
	ball.yDirect = 0;
}
