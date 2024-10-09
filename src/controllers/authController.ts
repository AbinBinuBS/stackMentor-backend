import {Request,Response} from 'express'
import passportAuth from '../config/passport'
import axios from 'axios'

interface AuthenticatedRequest extends Request {
    user?: {
        email?:string;
        displayName?:string
    }
}

declare module 'express-session' {
    interface Session {
        username?: string
    }
}

export const googleAuth = passportAuth.authenticate('google', { scope: ['email', 'profile'] });

export const googleAuthCallback = passportAuth.authenticate('google', {
    successRedirect: '/auth/callback/success',
    failureRedirect: '/auth/callback/failure'
});

export const authSuccess = async(req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
        return res.redirect('https://999bookstore.online/auth/callback/failure');
    }

    try {
    const email =  req.user.email
    const checkMailResponse = await axios.post("https://999bookstore.online/api/mentees/checkMail",{email})
    if(checkMailResponse.data.emailExists){
        const accessToken = checkMailResponse.data.accessToken
        const refreshToken = checkMailResponse.data.refreshToken
       return res.redirect(`https://999bookstore.online/?accessToken=${accessToken}&refreshToken=${refreshToken}`)
    }else{
        const userName = req.user.displayName
        const storeMail = await axios.post("https://999bookstore.online/api/mentees/googleRegister",{userName,password:'123456',email})
        if(storeMail){
            const accessToken = storeMail.data.accessToken
            const refreshToken= storeMail.data.refreshToken
            return res.redirect(`https://999bookstore.online/?accessToken=${accessToken}&refreshToken=${refreshToken}`);
        }
    }
    } catch (error) {
        console.error('error in checking mail of google auth',error)
    }
    
    
};


export const authFailure = (req: Request, res: Response) => {
    res.redirect('http://localhost:5173/login')
};


