import db from "../db/db";
import { GameRoom } from "./interface";
import { GameState } from "./interface";
import { WIDTH, HEIGHT } from "./interface";


export function initGameRoom(idRoom: number, id_player1: number, id_player2: number, mode: string, tournament_id: number) : GameRoom
{
	const username1Result = db.prepare("SELECT username FROM users WHERE id = ?").get(id_player1);
	const username2Result = db.prepare("SELECT username FROM users WHERE id = ?").get(id_player2);

	const username1 = (username1Result as { username: string }).username;
	const username2 = (username2Result as { username: string }).username;

	const gameroom: GameRoom =
	{
		id: idRoom,
		mode: mode,
		tournament_id: tournament_id,
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
		gameState: initGame(username1, username2, id_player1, id_player2),
		sockets: [],
	}
	return gameroom;
}


export function initGame(namePlayer1: string, namePlayer2: string, id_player1: number, id_player2: number) : GameState
{
	const gameState: GameState =
	{
		player1:
		{
			username: namePlayer1,
			id_player: id_player1,
			score: 0,
			paddle: {
				width: 15,
				height: 100,
				x: 10,
				y: 0,
				speed: 15
			},
			key_pressed: ""
		},
		player2:
		{
			username: namePlayer2,
			id_player: id_player2,
			score: 0,
			paddle: {
				width: 15,
				height: 100,
				x: WIDTH - 30,
				y: HEIGHT - 100,
				speed: 15
			},
			key_pressed: ""
		},
		ball:
		{
			x : WIDTH / 2,
			y : HEIGHT / 2,
			radius: 11,
			xDirect : 5,
			yDirect : 0,
			speed: 5
		},
		ia: undefined,
		clock: undefined,
		is_running: false
	}
	return gameState;
}
