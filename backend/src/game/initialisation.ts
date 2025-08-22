import db from "../db/db";
import { GameRoom } from "./interface";
import { GameState } from "./interface";
import { WIDTH, HEIGHT } from "./interface";


export function initGameRoom(idRoom: number, id_player1: number, id_player2: number, mode: string) : GameRoom
{
	const username1Result = db.prepare("SELECT username FROM users WHERE id = ?").get(id_player1);
	const username2Result = db.prepare("SELECT username FROM users WHERE id = ?").get(id_player2);

	const username1 = (username1Result as { username: string }).username;
	const username2 = (username2Result as { username: string }).username;

	const gameroom: GameRoom =
	{
		id: idRoom,
		mode: mode,
		player1:
		{
			id_player: id_player1,
			username: username1,
		},
		player2:
		{
			id_player: id_player2,
			username: username2,
		},
		gameState: initGame(username1, username2),
	}
	return gameroom;
}


export function initGame(namePlayer1: string, namePlayer2: string) : GameState
{
	const gameState: GameState =
	{
		player1:
		{
			name: namePlayer1,
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
			name: namePlayer2,
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
