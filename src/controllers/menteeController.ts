import { Request, Response } from 'express';
import MenteeService from '../services/menteeService';

class MenteeController {
    constructor(private menteeService: MenteeService) {}

    async menteeRegister(req: Request, res: Response): Promise<void> {
        try {
            const menteeData = req.body;
            await this.menteeService.createMentee(menteeData);
            res.status(201).json({message:"OTP Send Successfully"});
        } catch (error) {
            if (error instanceof Error) {
                if (error.message === 'Mentee already exists.') {
                    res.status(409).json({ message: error.message }); 
                } else if (error.message === 'Email is required to create a mentee.') {
                    res.status(400).json({ message: error.message });  
                } else {
                    console.error(`Error in menteeRegister: ${error.message}`);
                    res.status(500).json({ message: 'Internal Server Error' });
                }
            } else {
                console.error(`Unknown error in menteeRegister: ${error}`);
                res.status(500).json({ message: 'Internal Server Error' });
            }
        }
    }

    async menteeLogin(req:Request,res:Response): Promise<void> {
        try{
            const mentee = req.body
            const menteeData = await this.menteeService.menteeLogin(mentee)
            if(menteeData){
                res.status(201).json({message:"Success",accessToken:menteeData.accessToken,refreshToken:menteeData.refreshToken})
            }
        }catch(error){
            if (error instanceof Error) {
                if (error.message === 'Email and password are required') {
                    res.status(409).json({ message: error.message });  
                } else if (error.message === 'User does not exist') {
                    res.status(400).json({ message: error.message });  
                } else {
                    console.error(`Invalid password ${error.message}`);
                    res.status(500).json({ message: error.message });
                }
            } else {
                console.error(`Unknown error in menteelogin: ${error}`);
                res.status(500).json({ message: 'Internal Server Error' });
            }
        }
    }


    async menteeOtp(req: Request, res: Response): Promise<void> {
      try {
        const otpData = req.body;
        if (!otpData.email || !otpData.otp) {
          res.status(400).json({ message: 'Email and OTP are required' });
          return;
        }
        const otpVerified = await this.menteeService.verifyOtp(otpData);
        if (otpVerified) {
          res.status(200).json({ message: 'OTP verified successfully', accessToken:otpVerified.accessToken,refreshToken:otpVerified.refreshToken });
        } else {
          res.status(401).json({ message: 'Invalid OTP ' });
        }
      } catch (error) {
        if(error instanceof Error){
            if(error.message == 'Time has been expired'){
                res.status(400).json({message: error.message})
            }else if(error.message == 'Otp is not matching'){
                res.status(400).json({message:"Invalid Otp"})
            }else{
                console.error('Error processing OTP:', error);
                res.status(500).json({ message: 'An error occurred while verifying OTP' });
            }
        }
      }
    }

    async resendOtp(req:Request,res:Response):Promise<void>{
        try{
            let email = req.body.email
            console.log("email",email)
            let verifyResentOtp = await this.menteeService.resendOtp(email)
            if(verifyResentOtp){
                res.status(200).json({message:"Resend otp is Successfull"})
            }
        }catch(error:unknown){
            if(error instanceof Error){
                if(error.message == 'Time has been Expired Try again.'){
                    res.status(500).json({message:"Time has been Expired Try again."})
                }
            }
        }
    }

    async resetWithEmail(req: Request, res: Response): Promise<void> {
        try {
            const email = req.body.email;
            if (!email) {
                res.status(400).json({ message: "Email is required." });
                return;
            }
            const verifyEmail = await this.menteeService.resetWithEmail(email);
            if(verifyEmail){
                res.status(200).json({ message: "Password reset link sent to your email." });
            }
        } catch (error : unknown) {
            if(error instanceof Error){
                if(error.message == 'Email does not exist.'){
                    res.status(400).json({message:'Email does not exist.'})
                }else{
                    res.status(500).json({ message: "An error occurred while processing your request." });
                }
            }
        }

        
    }

    async resetPassswordOtp(req:Request,res:Response):Promise<void>{
        try{
            const otpData = req.body;
            if (!otpData.email || !otpData.otp) {
            res.status(400).json({ message: 'Email and OTP are required' });
            return;
            }
            const otpVerified = await this.menteeService.forgetPasswordVerifyOtp(otpData);
            if (otpVerified) {
                res.status(200).json({ message: 'OTP verified successfully',email:otpVerified.email});
            } else {
                res.status(401).json({ message: 'Invalid OTP ' });
            }
        }catch(error:unknown){
            if(error instanceof Error){
                if(error.message == 'Email or OTP is missing'){
                    res.status(401).json({message:'OTP is missing.'})
                }else if(error.message == 'OTP verification failed'){
                    res.status(401).json({ message: 'Invalid OTP ' });
                }
            }
        }
    }

    async resetPasssword(req:Request,res:Response): Promise<void>{
        try{
            const email = req.body.email
            const newPassword = req.body.values.newPassword
            const responceData = await this.menteeService.resetPassword(email,newPassword)
            if(responceData){
                res.status(200).json({message:"Success"})
            }else{
                res.status(400).json({message:"Failled"})
            }
        }catch(error){
            console.log(error);
        }
    }

    
}

export default MenteeController;
