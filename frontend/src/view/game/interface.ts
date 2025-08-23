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
	username: string;
	id_player: number;
	score: number;
	paddle: Paddle;
	key_pressed: string
}

export interface GameState {
	player1: Player;
	player2: Player;
	ball: Ball,
	is_running: boolean
}
