// Define types for the database records
export interface User{
	id: number;
	username: string;
	email: string;
	password_hash?: string;
	avatar_url?: string;
	games_played?: number;
	games_won?: number;
	is_connected: number;
	socket_id?: number;
	room_id: number;
	google_id?: string;
	twofa_enable?: boolean;
	twofa_secret: string;
	username_tournament?: string;
}

export interface Friend {
	id: number;
	user_id: number;
	friend_id: number;
	status: 'pending' | 'accepted' | 'rejected';
}
