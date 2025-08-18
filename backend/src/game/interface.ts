import { Socket } from "socket.io";

// ===============================================
// 			INTERFACE GAME LOGIC				||
// ===============================================

export const WIDTH = 800;
export const HEIGHT = 600;

export interface Paddle {
	width: number;
	height: number;
	x: number;
	y: number;
	speed: number
}

export interface Ball {
	x: number;
	y: number;
	radius: number;
	xDirect: number;
	yDirect: number;
	speed: number
}

export interface Player {
	name: string;
	score: number;
	paddle: Paddle
}

export interface GameState {
	player1: Player;
	player2: Player;
	ball: Ball
}


// ===========================================
// 			INTERFACE WS LOGIC				||
// ===========================================

interface PlayerConnection {
	socket: Socket;
	token: string | null; // faut delete ça nan ?
	username: string;
}


export interface GameRoom {
	id: number;
	player1: PlayerConnection;
	player2: PlayerConnection;
	gameState: GameState;
}


const rooms = new Map<number, GameRoom>();
let idRoom = 0;


export function getNextRoomId(): number {
	return idRoom++;
}

export function setRoom(id: number, gameRoom: GameRoom) {
	rooms.set(id, gameRoom)
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
