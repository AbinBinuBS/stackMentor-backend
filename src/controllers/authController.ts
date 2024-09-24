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
        return res.redirect('/auth/callback/failure');
    }

    try {
    const email =  req.user.email
    console.log("111111111111111111111111111111111",email)
    // const checkMailResponse = await axios.post("http://localhost:3000/checkMail",{email})
    // if(checkMailResponse.data.emailExists){
    //     const token = checkMailResponse.data.token
    //    return res.redirect(`http://localhost:5173/?token=${token}`)
    // }else{
    //     const userName = req.user.displayName
    //     const storeMail = await axios.post("http://localhost:3000/userRegister",{userName,password:'123456',email})
    //     if(storeMail){
    //         const token = storeMail.data.token
    //         return res.redirect(`http://localhost:5173/?token=${token}`)
    //     }
    // }
    } catch (error) {
        console.error('error in checking mail of google auth',error)
    }
    
    
};


export const authFailure = (req: Request, res: Response) => {
    res.redirect('http://localhost:5173/login')
};


