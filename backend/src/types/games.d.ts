export interface Games {
	id: number;
	player_id_left: number;
	player_id_right?: number;
	palyer_id_won?: number;
	date : string;
	score?: string;
	tournament_id?: number;
}

export interface Tournament {
	id: number;
	name: string;
	nbr_player: number;
	player_won?: number;
	date: string;
}
