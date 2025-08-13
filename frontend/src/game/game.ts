import type { GameState, Player, Paddle, Ball } from "./interface";
import {WIDTH, HEIGHT} from "./interface"

export function renderGame() {
  document.getElementById("app")!.innerHTML = `
    <div id="gameContainer" class="flex flex-col items-center justify-center h-screen bg-black">

      <!-- Ligne du haut : noms et score -->
      <div class="w-[800px] flex justify-between text-white mb-4">
        <div id="player1" class="text-lg font-bold">Player 1</div>
        <div id="score" class="text-lg font-bold">0 : 0</div>
        <div id="player2" class="text-lg font-bold">Player 2</div>
      </div>

      <!-- Zone de jeu -->
      <canvas id="pong" width="${WIDTH}" height="${HEIGHT}" class="bg-black relative z-50 border border-white"></canvas>
    </div>
  `;
}


export function initGame() : GameState
{
	const gameState: GameState =
	{
		player1:
		{
			name: "Player1",
			score: 0,
			paddle: {
				width: 20,
				height: 100,
				x: 10,
				y: 0,
				speed: 50
			}
		},
		player2:
		{
			name: "Player2",
			score: 0,
			paddle: {
				width: 20,
				height: 100,
				x: WIDTH - 30,
				y: HEIGHT - 100,
				speed: 50
			}
		},
		ball:
		{
			x : WIDTH / 2,
			y : HEIGHT / 2,
			radius: 11,
			xDirect : 0,
			yDirect : 0,
			speed: 1
		}
	}
	return gameState;
}


export function drawGame(gameState: GameState)
{
	const canvas = document.getElementById("pong") as HTMLCanvasElement;
	const ctx = canvas.getContext("2d");
	if (!ctx) return;

	// Efface l'écran
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	// Dessine les paddles
	ctx.fillStyle = "white";
	ctx.fillRect(
		gameState.player1.paddle.x,
		gameState.player1.paddle.y,
		gameState.player1.paddle.width,
		gameState.player1.paddle.height
	);
	ctx.fillRect(
		gameState.player2.paddle.x,
		gameState.player2.paddle.y,
		gameState.player2.paddle.width,
		gameState.player2.paddle.height
	);

	// Dessine la balle
	//ctx.beginPath();
	ctx.arc(
		gameState.ball.x,
		gameState.ball.y,
		gameState.ball.radius,
		0,
		Math.PI * 2
	);
	ctx.fill();
}

export function gameLoop() {
	let gameState = initGame();
	drawGame(gameState);
}
