import {FastifyInstance, FastifyReply, FastifyRequest} from "fastify";
import dotenv from "dotenv";
import OAuth2, {OAuth2Namespace} from "@fastify/oauth2";
import { loginOrCreateGoogleUser } from "./auth";
import { logToELK } from "../elk";


dotenv.config();

declare module 'fastify' {
	interface FastifyInstance {
		GoogleOAuth2: OAuth2Namespace;
	}
}

// Validation des variables d'environnement
const requiredEnvVars = {
	GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
	GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
	GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI
};

// Vérifier que toutes les variables d'environnement sont définies
for (const [key, value] of Object.entries(requiredEnvVars)) {
	if (!value) {
		console.error(`❌ Missing environment variable: ${key}`);
		console.log(`Please define ${key} in your .env file`);
	}
}

// Google OAuth2 Options
const googleOAuth2Options = {
	name: 'GoogleOAuth2',
	scope: ['profile', 'email'],
	credentials: {
		client: {
			id: process.env.GOOGLE_CLIENT_ID as string,
			secret: process.env.GOOGLE_CLIENT_SECRET as string
		},
		auth: OAuth2.GOOGLE_CONFIGURATION
	},
	startRedirectPath: '/auth/google',
	callbackUri: process.env.GOOGLE_REDIRECT_URI as string
};

export function registerGoogleOAuth2Provider(app: FastifyInstance) {
	app.register(OAuth2, googleOAuth2Options);
}

export async function googleOauth(request: FastifyRequest, reply: FastifyReply, app: FastifyInstance) {
	try {
		const token = await app.GoogleOAuth2.getAccessTokenFromAuthorizationCodeFlow(request);

		const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
			headers: {
				Authorization: `Bearer ${token.token.access_token}`
			}
		});

		if (!userInfoResponse.ok) {
			throw new Error('Failed to get user info from Google');
		}

		const userInfo = await userInfoResponse.json();

		const { email, name, picture, id } = userInfo;

		const result = await loginOrCreateGoogleUser(email, id);

		return result;
	} catch (err) {
		console.error('Google OAuth error:', err);
		await logToELK('error', 'google auth failed', { function: 'registerGoogle', reason: err});
		return { statusCode: 500, message: 'G_oAuth Authentication failed' };
	}
}
