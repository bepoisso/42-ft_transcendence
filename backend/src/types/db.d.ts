// Define types for the database records
export interface User{
	id: number;
	username: string;
	email?: string;
	password_hash?: string;
	github_id?: string;
}
