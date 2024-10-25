import { Request, Response } from "express";
import cloudinary from "../utils/cloudinary";
import fs from 'fs'
import { IScheduleTime } from "../models/mentorTimeSchedule";
import { FileUrls, UploadResult } from "../types/servicesInterfaces/ICloudinary";
import { MentorVerifyFiles } from "../types/servicesInterfaces/IMentor";
import { IMentorService } from "../interfaces/mentor/IMentorService";



function isSupportedFileType(file: Express.Multer.File, fieldName: string): boolean {
    const imageFileTypes = ['image/jpeg', 'image/png'];
    const documentFileTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (fieldName === 'image') {
        return imageFileTypes.includes(file.mimetype);
    } else {
        return documentFileTypes.includes(file.mimetype);
    }
}



class MentorController{
    constructor(private mentorService : IMentorService){}

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


    async resetWithEmail(req: Request, res: Response): Promise<void> {
        try {
            const email = req.body.email;
            const verifyEmail = await this.mentorService.resetWithEmail(email);
            if(verifyEmail){
                res.status(200).json({ message:"Password reset link sent to your email." });
            }
        } catch (error : unknown) {
            if(error instanceof Error){
                if(error.message == 'Email does not exist.'){
                    res.status(400).json({message:'Email does not exist.'})
                }else{
                    res.status(500).json({ message: "An error occurred while processing your request." });
                }
            }else{
            res.status(500).json({ message: "An error occurred while processing your request." });
            }
        }

        
    }

    async resetPassswordOtp(req:Request,res:Response):Promise<void>{
        try{
            const otpData = req.body;
            const otpVerified = await this.mentorService.forgetPasswordVerifyOtp(otpData);
            if (otpVerified) {
                res.status(200).json({ message: 'OTP verified successfully',email:otpVerified.email});
            } else {
                res.status(401).json({ message: 'Invalid OTP ' });
            }
        }catch(error:unknown){
            if(error instanceof Error){
                if(error.message == 'Email or OTP is missing'){
                    res.status(401).json({message:'OTP is missing.'})
                }else if(error.message == 'otp is not matching'){
                    res.status(401).json({ message: 'Invalid OTP ' });
                }
            }else{
                res.status(500).json({ message: "An error occurred while processing your request." });
            }
        }
    }

    async resetPasssword(req:Request,res:Response): Promise<void>{
        try{
            const email = req.body.email
            const newPassword = req.body.newPassword
            const responceData = await this.mentorService.resetPassword(email,newPassword)
            if(responceData){
                res.status(200).json({message:"Success"})
            }else{
                res.status(400).json({message:"Failled"})
            }
        }catch(error){
            console.log(error);
        }
    }


    async verifyCheck(req:Request,res:Response):Promise<void>{
        try{
            const accessToken = req.headers['authorization'] as string;
            const mentorData = await this.mentorService.isVerifiedMentor(accessToken)
            if(mentorData == "beginner"){
                res.status(200).json({message:"Mentor is a beginner.",mentorData})
            }else if(mentorData == "applied"){
                res.status(200).json({message:"Mentor is a applied.",mentorData})
            }else if(mentorData == "verified"){
                res.status(200).json({message:"Mentor is a verified.",mentorData})
            }else if(mentorData == "rejected"){
                res.status(200).json({message:"Mentor is a rejected.",mentorData})
            }
        }catch(error){
            if(error instanceof Error){
                console.log(error.message);
            }
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }
    
    
    async  verifymentor(req: Request, res: Response): Promise<void> {
        try {
            const mentorData = req.body;
            const authHeader = req.headers['authorization'] as string;
            const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    
            if (!authHeader) {
                res.status(400).json({ message: 'Authorization header is missing.' });
                return;
            }
    
            const token = authHeader.replace('Bearer ', '');
            const mentorFiles: MentorVerifyFiles = {
                resume: files['resume'] ? files['resume'][0] : undefined,
                degreeCertificate: files['degreeCertificate'] ? files['degreeCertificate'][0] : undefined,
                experienceCertificate: files['experienceCertificate'] ? files['experienceCertificate'][0] : undefined,
                image: files['image'] ? files['image'][0] : undefined
            };
            for (const [key, file] of Object.entries(mentorFiles)) {
                if (file && !isSupportedFileType(file, key)) {
                    res.status(400).json({ message: `${key} has an unsupported file type.` });
                    return;
                }
            }
    
            const uploadResults: UploadResult[] = await Promise.all(
                Object.keys(mentorFiles).map(async (key) => {
                    const file = mentorFiles[key as keyof MentorVerifyFiles];
                    if (file) {
                        try {
                            const result = await cloudinary.uploader.upload(file.path, {
                                resource_type: 'auto'
                            });
                            return { [key]: result.secure_url } as UploadResult;
                        } catch (uploadError) {
                            console.error(`${key} upload failed:`, uploadError);
                            throw new Error(`Cloudinary upload failed for ${key}`);
                        }
                    }
                    return { [key]: null } as UploadResult;
                })
            );
    
            const fileUrls: FileUrls = uploadResults.reduce((acc: FileUrls, result: UploadResult) => ({
                ...acc,
                ...result
            }), {
                resume: null,
                degreeCertificate: null,
                experienceCertificate: null,
                image: null
            });
    
            const isVerified = await this.mentorService.verifyMentor({ ...mentorData, fileUrls }, token);
            await Promise.all(
                Object.keys(mentorFiles).map(async (key) => {
                    const file = mentorFiles[key as keyof MentorVerifyFiles];
                    if (file) {
                        fs.unlink(file.path, (err) => {
                            if (err) {
                                console.error(`Error deleting file ${file.path}:`, err);
                            }
                        });
                    }
                })
            );
    
            if (isVerified) {
                res.status(200).json({ message: "Verification complete", data: { ...mentorData, fileUrls } });
            } else {
                res.status(200).json({ message: "Verification failed, try again later.", data: { ...mentorData, fileUrls } });
            }
        } catch (error: unknown) {
            if (error instanceof Error) {
                console.error('Error during verification:', error.message);
                res.status(500).json({ message: error.message });
            } else {
                console.error('Unknown error during verification:', error);
                res.status(500).json({ message: 'Internal server error' });
            }
        }
    }
    
    async createNewRefreshToken(req:Request,res:Response):Promise<void>{
        try{
            const { refreshToken } = req.body;
            const response = await this.mentorService.createNewRefreshToken(refreshToken)
            if(response){
                res.status(201).json({message:"Success",accessToken:response.accessToken,refreshToken:response.refreshToken})
            }else{
                res.status(500).json({ message: 'Internal server error' });
            }
        }catch(error){
            if (error instanceof Error) {
                console.error( error.message);
                res.status(500).json({ message: error.message });
            } else {
                console.error('Unknown error during refreshing token:', error);
                res.status(500).json({ message: 'Internal server error' });
            }
        }
    }
    

    async scheduleTimeForMentor(req: Request, res: Response): Promise<void> {
        try {
            const mentorId = (req as any).mentor.id;
            const scheduleData: IScheduleTime = req.body;
            let scheduleTimes: IScheduleTime[];

            switch (scheduleData.scheduleType) {
                case 'normal':
                    scheduleTimes = await this.mentorService.scheduleNormalTime(scheduleData, mentorId);
                    break;
                case 'weekly':
                    scheduleTimes = await this.mentorService.scheduleWeeklyTime(scheduleData, mentorId);
                    break;
                case 'custom':
                    scheduleTimes = await this.mentorService.scheduleCustomTime(scheduleData, mentorId);
                    break;
                default:
                    throw new Error('Invalid schedule type');
            } 

            if (scheduleTimes.length > 0) {
                res.status(200).json({ message: "Time scheduled successfully.", scheduleTimes });
            } else {
                res.status(400).json({ message: "No time slots were scheduled. They might all overlap with existing schedules." });
            }
        } catch (error) {
            if (error instanceof Error) {
                console.error('Error during time scheduling:', error.message);
                res.status(400).json({ message: error.message });
            } else {
                console.error('Unknown error during time scheduling:', error);
                res.status(500).json({ message: 'Internal server error' });
            }
        }
    }
    
    

    async getScheduledSlots(req: Request, res: Response): Promise<void> {
        try {
            const page = parseInt(req.query.page as string) || 1; 
            const limit = parseInt(req.query.limit as string) || 6;
            const date = req.query.date as string;
            const accessToken = req.headers['authorization'] as string;
            console.log(req.query); 
            const slotsData = await this.mentorService.getScheduledSlots(accessToken, page, limit, date);
            console.log(slotsData)
            res.status(200).json({ message: "Slots sent successfully", sloteData: slotsData?.slots,totalCount:slotsData?.totalCount });
        } catch (error) {
            if (error instanceof Error) {
                console.error(error.message);
                res.status(500).json({ message: error.message });
            } else {
                console.error('Unknown error during getting slots:', error);
                res.status(500).json({ message: 'Internal server error' });
            }
        }
    }
    

    async deleteScheduledSlot(req:Request,res:Response):Promise<void>{
        try{
            const { id } = req.params
           const slotsData = await this.mentorService.deleteScheduledSlot(id)
           if(slotsData){
            res.status(200).json({message:"Slots deleted successfully" })
           }else{
            res.status(401).json({message:"Unknown error during  removing slots." })
           }
        }catch(error){
            if (error instanceof Error) {
                if(error.message == "This slots already booked."){
                    res.status(203).json({message:error.message})
                }else{
                    console.error( error.message);
                    res.status(500).json({ message: error.message });
                }
            } else {
                console.error('Unknown error during  removing slots:', error);
                res.status(500).json({ message: 'Internal server error' });
            }
        }
    }

    async getBookedSlots(req: Request, res: Response): Promise<void> {
        try {
            const page = parseInt(req.query.page as string) || 1; 
            const limit = parseInt(req.query.limit as string) || 5;
            const accessToken = req.headers['authorization'] as string;
            const { slots, totalCount } = await this.mentorService.getBookedSlots(accessToken, page, limit);
            res.status(200).json({
                message: "Success",
                slots: slots,
                totalCount: totalCount,
            });
        } catch (error) {
            if (error instanceof Error) {
                console.error(error.message);
                res.status(500).json({ message: error.message });
            } else {
                console.error('Unknown error during fetching slots:', error);
                res.status(500).json({ message: 'Internal server error' });
            }
        }
    }
    


    async getMentorData(req:Request,res:Response):Promise<void>{
        try{
            const mentor =  (req as any).mentor; 
            const mentorId = mentor?.id
            const mentorVerification = await this.mentorService.getMentorData(mentorId)
            res.status(200).json(mentorVerification)
        }catch(error){
            if (error instanceof Error) {
                console.error( error.message);
                res.status(500).json({ message: error.message });
            } else {
                console.error('Unknown error during  mentor:', error);
                res.status(500).json({ message: 'Internal server error' });
            }
        }
    }

    async editProfile(req: Request, res: Response): Promise<void> {
        try {
            const { name } = req.body;
            const mentorId = (req as any).mentor.id;
            let imageUrl: string | undefined;
    
            if (req.file) {
                const result = await cloudinary.uploader.upload(req.file.path, {
                    folder: 'mentor_profiles',
                });
                imageUrl = result.secure_url;
            }
            const mentorResponse = await this.mentorService.editProfile(name, mentorId, imageUrl);
            res.status(200).json({message:"Success"});
        } catch (error) {
            if (error instanceof Error) {
                console.error(error.message);
                res.status(500).json({ message: error.message });
            } else {
                console.error('Unknown error during mentor profile update:', error);
                res.status(500).json({ message: 'Internal server error' });
            }
        }
    }

    async changePassword(req:Request,res:Response): Promise<void>{
        try{
            const {oldPassword,newPassword} = req.body
            const mentorId = (req as any).mentor.id
            const updatePassword = await this.mentorService.changePassword(oldPassword,newPassword,mentorId)
            if(updatePassword){
                res.status(200).json({message:"Success"})
            }else{
                res.status(500).json({ message: 'Internal server error' });
            }
        } catch (error) {
            if (error instanceof Error) {
                if(error.message == "password don't match"){
                    res.status(400).json({message:"old password don't match"})
                }else{
                    res.status(500).json({ message: error.message });
                }
            } else {
                console.error('Unknown error during mentor profile update:', error);
                res.status(500).json({ message: 'Internal server error' });
            }
        }
    }


    async cancelSlot(req:Request,res:Response):Promise<void>{
        try{
            const slotId = req.body.id
            await this.mentorService.cancelSlot(slotId)
            res.status(200).json({message:"Slot cancelled successfully"})
        }catch(error){
            if (error instanceof Error) {
                console.error( error.message);
                res.status(500).json({ message: error.message });
            } else {
                console.error('Unknown error during  mentor:', error);
                res.status(500).json({ message: 'Internal server error' });
            }
        }
    }

    async allowConnection(req:Request,res:Response):Promise<void>{
        try{
            const bookedId = req.body.bookedId
            const setConnection = await this.mentorService.allowConnection(bookedId)
            res.status(200).json({message:"Success"})
        }catch(error){
            if (error instanceof Error) {
                console.error( error.message);
                res.status(500).json({ message: error.message });
            } else {
                console.error('Unknown error during  mentor:', error);
                res.status(500).json({ message: 'Internal server error' });
            }
        }
    }

    async endConnection(req:Request,res:Response):Promise<void>{
        try{
            const bookedId = req.body.bookedId
            await this.mentorService.endConnection(bookedId)
            res.status(200).json({message:"Success"})
        }catch(error){
            if (error instanceof Error) {
                console.error( error.message);
                res.status(500).json({ message: error.message });
            } else {
                console.error('Unknown error during  mentor:', error);
                res.status(500).json({ message: 'Internal server error' });
            }
        }
    }

    async getAllQuestions(req:Request,res:Response):Promise<void>{
        try{
            const page = parseInt(req.query.page as string) || 1; 
            const limit = parseInt(req.query.limit as string) || 5; 
            const status = req.query.isAnswered as string
            const mentorId = (req as any).mentor.id
            const { questions,total} = await this.mentorService.getAllQuestions(mentorId,page,limit,status)
            res.status(200).json({message:"Success",questions,total})
        }catch(error){
            if (error instanceof Error) {
                console.error( error.message);
                res.status(500).json({ message: error.message });
            } else {
                console.error('Unknown error during  mentor:', error);
                res.status(500).json({ message: 'Internal server error' });
            }
        }
    }

    async submitQAAnswer(req:Request,res:Response):Promise<void>{
        try{
            const mentorId = (req as any).mentor.id
            const { questionId , answer} = req.body
            const submitAnwer = await this.mentorService.submitQAAnswer(questionId,mentorId,answer)
            res.status(200).json({message:"Success"})
        }catch(error){
            if (error instanceof Error) {
                console.error( error.message);
                res.status(500).json({ message: error.message });
            } else {
                console.error('Unknown error during  :', error);
                res.status(500).json({ message: 'Internal server error' });
            }
        }
    }

    async editQAAnswer(req:Request,res:Response):Promise<void>{
        try{
            const mentorId = (req as any).mentor.id
            const { questionId , answer} = req.body
            const editAnswer = await this.mentorService.editQAAnswer(questionId,mentorId,answer)
            res.status(200).json({message:"Success"})
        }catch(error){
            if (error instanceof Error) {
                console.error( error.message);
                res.status(500).json({ message: error.message });
            } else {
                console.error('Unknown error during  :', error);
                res.status(500).json({ message: 'Internal server error' });
            }
        }
    }

    async createComminityMeet(req:Request,res:Response):Promise<void>{
        try{
            const mentorId = (req as any).mentor.id
            const formData = req.body
            let imageUrl: string | undefined;
            if (req.file) {
                const result = await cloudinary.uploader.upload(req.file.path, {
                    folder: 'mentor_profiles',
                });
                imageUrl = result.secure_url;
            }
            if(!imageUrl){
                res.status(500).json({ message: 'Internal server error' })
                return
            }
            const createMeet = await this.mentorService.createComminityMeet(formData,mentorId,imageUrl)
            res.status(200).json({message:"Success"})
        }catch(error){
            if (error instanceof Error) {
                console.error( error.message);
                res.status(500).json({ message: error.message });
            } else {
                console.error('Unknown error during createComminityMeet :', error);
                res.status(500).json({ message: 'Internal server error' });
            }
        }
    }

    async getAllCommunityMeet(req:Request,res:Response):Promise<void>{
        try{
            const meetData = await this.mentorService.getAllCommunityMeet()
            res.status(200).json({message:"Success",meetData})
        }catch(error){
            if (error instanceof Error) {
                console.error( error.message);
                res.status(500).json({ message: error.message });
            } else {
                console.error('Unknown error during  :', error);
                res.status(500).json({ message: 'Internal server error' });
            }
        }
    }


    async getMyCommunityMeet(req:Request,res:Response):Promise<void>{
        try{
            const mentorId = (req as any).mentor.id
            const meetData = await this.mentorService.getMyCommunityMeet(mentorId)
            res.status(200).json({message:"Success",meetData})
        }catch(error){
            if (error instanceof Error) {
                console.error( error.message);
                res.status(500).json({ message: error.message });
            } else {
                console.error('Unknown error during  :', error);
                res.status(500).json({ message: 'Internal server error' });
            }
        }
    }

    async cancelCommunityMeet(req:Request,res:Response):Promise<void>{
        try{
            const meetId = req.params.meetId
            const about = req.body.data.reason
            const cancelMeet = await this.mentorService.cancelCommunityMeet(meetId,about)
            res.status(200).json({message:"Success"})
        }catch(error){
            if (error instanceof Error) {
                console.error( error.message);
                res.status(500).json({ message: error.message });
            } else {
                console.error('Unknown error during  :', error);
                res.status(500).json({ message: 'Internal server error' });
            }
        }
    }
    async getMentorRating(req: Request, res: Response): Promise<void> {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 5;
            const mentorId = (req as any).mentor.id;
    
            const { ratings, totalCount, ratingCounts, totalPages } = await this.mentorService.getMentorRating(mentorId, page, limit);
    
            res.status(200).json({
                message: "Success",
                ratings,
                totalPages,
                totalCount,
                ratingCounts
            });
        } catch (error) {
            if (error instanceof Error) {
                console.error(error.message);
                res.status(500).json({ message: error.message });
            } else {
                console.error('Unknown error during :', error);
                res.status(500).json({ message: 'Internal server error' });
            }
        }
    }

    async getNotifications(req:Request,res:Response):Promise<void>{ 
        try{
            const mentorId = (req as any).mentor.id
            const notifications = await this.mentorService.getNotifications(mentorId)
            res.status(200).json({message:"Success",notifications:notifications})
        }catch(error){
            if (error instanceof Error) {
                console.error( error.message);
                res.status(500).json({ message: error.message });
            } else {
                console.error('Unknown error during  :', error);
                res.status(500).json({ message: 'Internal server error' });
            }
        }
    }

    async markReadChat(req:Request,res:Response):Promise<void>{ 
        try{
            const mentorId = (req as any).mentor.id
            const chatId = req.params.id as string
            const readChat = await this.mentorService.markReadChat(mentorId,chatId)
            res.status(200).json({message:"Success"})
        }catch(error){
            if (error instanceof Error) {
                console.error( error.message);
                res.status(500).json({ message: error.message });
            } else {
                console.error('Unknown error during  :', error);
                res.status(500).json({ message: 'Internal server error' });
            }
        }
    }
    
    
}
export default MentorController