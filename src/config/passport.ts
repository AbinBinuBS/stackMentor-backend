import passport from "passport";
import {
	Strategy as GoogleStrategy,
	VerifyCallback,
} from "passport-google-oauth2";
import dotenv from "dotenv";
import { User } from "../types/commonInterfaces/passportInterfaces";

dotenv.config();

passport.serializeUser((user: User, done: (err: any, id?: any) => void) => {
	done(null, user);
});

passport.deserializeUser((user: User, done: (err: any, id?: any) => void) => {
	done(null, user);
});

passport.use(
	new GoogleStrategy(
		{
			clientID: process.env.CLIENT_ID as string,
			clientSecret: process.env.CLIENT_SECRET as string,
			callbackURL: "https://stackmentor.shop/auth/callback",
			passReqToCallback: true,
		},
		function (
			request: any,
			accessToken: string,
			refreshToken: string,
			profile: any,
			done: VerifyCallback
		) {
			return done(null, profile);
		}
	)
);

export default passport;
