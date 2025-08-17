// Define types for the database records
export interface User{
	id: number;
	username: string;
	email?: string;
	password_hash?: string;
	google_id?: string;
	twofa_enable?: boolean;
	twofa_secret: string;
}
