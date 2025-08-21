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
	tournament_name: string;
	nbr_player: number;
	player_1: number;
	player_2?: number;
	player_3?: number;
	player_4?: number;
	player_5?: number;
	player_6?: number;
	player_7?: number;
	player_8?: number;
	player_won?: number;
	tournament_date: string;
	tournament_status: string;
}
