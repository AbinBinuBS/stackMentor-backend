


import * as passport from 'passport';
import { Strategy as GoogleStrategy, VerifyCallback } from 'passport-google-oauth2';
import dotenv from 'dotenv'


dotenv.config()


interface User {
    id?: string;
    email?: string;
    displayName?: string;
}

passport.serializeUser((user: User, done: (err: any, id?: any) => void) => {
    done(null, user);
});

passport.deserializeUser((user: User, done: (err: any, id?: any) => void) => {
    done(null, user);
});



export default passport