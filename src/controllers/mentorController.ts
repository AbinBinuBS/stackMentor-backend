import { Request, Response } from "express";
import MentorService from "../services/mentorService";



class MentorController{
    constructor(private mentorService : MentorService){}

    async mentorRegister(req:Request,res:Response) : Promise<void>{
        try {
            const mentorData = req.body;
            await this.mentorService.createMentor(mentorData);
            res.status(200).json({message:"OTP Send Successfully"});
        } catch (error) {
            if (error instanceof Error) {
                if (error.message === 'Mentor already exists.') {
                    res.status(409).json({ message: error.message }); 
                } else if (error.message === 'Email is required to create a mentor.') {
                    res.status(400).json({ message: error.message });  
                } else {
                    console.error(`Error in mentorRegister: ${error.message}`);
                    res.status(500).json({ message: 'Internal Server Error' });
                }
            } else {
                console.error(`Unknown error in mentorRegister: ${error}`);
                res.status(500).json({ message: 'Internal Server Error' });
            }
        }
    }

    async mentorOtp(req: Request, res: Response): Promise<void> {
        try {
          const otpData = req.body;
          if (!otpData.email || !otpData.otp) {
            res.status(400).json({ message: 'OTP are required' });
            return;
          }
          const otpVerified = await this.mentorService.verifyOtp(otpData);
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
            let verifyResentOtp = await this.mentorService.resendOtp(email)
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

    async mentorLogin(req:Request,res:Response) : Promise<void>{
        try{
            const mentor = req.body
            const mentorData = await this.mentorService.mentorLogin(mentor)
            if(mentorData){
                res.status(201).json({message:"Success",accessToken:mentorData.accessToken,refreshToken:mentorData.refreshToken})
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
                console.error(`Unknown error in mentorlogin: ${error}`);
                res.status(500).json({ message: 'Internal Server Error' });
            }
        }
    }


    async verifymentor(req: Request, res: Response): Promise<void> {
        try {
            const mentorData = req.body;
            console.log("Mentor Data:", mentorData); 
    
    
            res.status(200).json({ message: "Verification complete", data: mentorData });
        } catch (error) {
            if (error instanceof Error) {
                console.error(error);
                res.status(500).json({ message: error.message });
            }
        }
    }
}
export default MentorController