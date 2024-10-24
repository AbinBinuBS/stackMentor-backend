import { Request, Response } from 'express';
import MenteeService from '../services/menteeService';
import stripe from '../config/stripe';

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

    async googleRegister(req: Request, res: Response): Promise<void> {
        try {
            const {userName,email,password} = req.body;
            const mentorData = await this.menteeService.googleRegister(userName,email,password)
            res.status(201).json(mentorData);
        } catch (error) {
            if (error instanceof Error) {
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

    async checkMenteeMail(req:Request,res:Response): Promise<void> {
        try{
            const email = req.body
            const menteeData = await this.menteeService.checkMenteeMail(email.email)
            if(menteeData){
                res.status(201).json(menteeData)
            }
        }catch(error){
            if (error instanceof Error) {
                console.error(`Invalid password ${error.message}`);
                res.status(500).json({ message: error.message });
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
            res.status(500).json({ message: "An error occurred while processing your request." });
        }
    }


    async getMentorData(req:Request,res:Response): Promise<void>{
        try{
            
            const level = req.query.level as string
            const stack = req.query.stack as string
            const mentorsData = await this.menteeService.getMentors(level,stack)
            res.status(200).json({mentorData:mentorsData})
        }catch(error){
            console.log(error);
            res.status(500).json({ message: "An error occurred while processing your request." });
        }
    }

    async getMentorSlots(req:Request,res:Response): Promise<void>{
        try{
            const id = req.params.id as string
            const slotDatas = await this.menteeService.getMentorSlots(id)
            res.status(200).json({message:"Success" ,slotsData:slotDatas.slots , mentorData:slotDatas.mentorVerification,ratings:slotDatas.ratings})
        }catch(error){
            console.log(error);
            res.status(500).json({ message: "An error occurred while processing your request." });
        }
    }


    async getBookedSlots(req:Request,res:Response): Promise<void>{
        try{
            const accessToken = req.headers['authorization'] as string;
            const bookedSlot = await this.menteeService.getBookedSlots(accessToken)
            res.status(200).json({message:"Success",bookedSlot})
        }catch(error){
            console.log(error);
            res.status(500).json({ message: "An error occurred while processing your request." });
        }
    }

    async getResheduleList(req:Request,res:Response): Promise<void>{
        try{
            const id = req.params.id as string
            const price = parseInt(req.params.price )
            const slotDatas = await this.menteeService.getResheduleList(id,price)
            res.status(200).json({message:"Success" ,availableSlots:slotDatas })
        }catch(error){
            console.log(error);
            res.status(500).json({ message: "An error occurred while processing your request." });
        }
    }

    async rescheduleBooking(req:Request,res:Response): Promise<void>{
        try{
            const oldId = req.body.oldSlotId
            const newId = req.body.newSlotId 
            await this.menteeService.rescheduleBooking(oldId,newId)
            res.status(200).json({message:"Success"})
        }catch(error){
            console.log(error);
            res.status(500).json({ message: "An error occurred while processing your request." });
        }
    }


    async getMenteeData(req:Request,res:Response):Promise<void>{
        try{
            const mentee =  (req as any).mentee; 
            res.status(200).json(mentee)
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

    async getWalletData(req: Request, res: Response): Promise<void> {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 5;
            const menteeId = (req as any).mentee.id;
    
            const walletData = await this.menteeService.getWalletData(menteeId, page, limit);
    
            res.status(200).json({ message: "Success", walletData });
        } catch (error) {
            if (error instanceof Error) {
                console.error(error.message);
                res.status(500).json({ message: error.message });
            } else {
                console.error('Unknown error during mentor fetch:', error);
                res.status(500).json({ message: 'Internal server error' });
            }
        }
    }
    

    async cancelSlot(req:Request,res:Response):Promise<void>{
        try{
            const slotId = req.body._id
            const slotData = await this.menteeService.cancelSlot(slotId)
            res.status(200).json({message:"Success" })
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


    async qaQuestion(req:Request,res:Response):Promise<void>{
        try{
            const menteeId = ( req as any).mentee.id
            const {title,body} = req.body
            const a = await this.menteeService.qaQuestion(title,body,menteeId)
            res.status(200).json({message:"Success" })
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
    

    async getAllQuestions(req:Request,res:Response):Promise<void>{
        try{
            const page = parseInt(req.query.page as string) || 1; 
		    const limit =  5; 
            const search = req.query.search as string || ""; 
            console.log(req.query)
            const  { questions, total }  = await this.menteeService.getAllQuestions( page,search,limit)
            res.status(200).json({message:"Success",questions,totalPages:total })
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
    
    
    async getMeets(req:Request,res:Response):Promise<void>{
        try{
            const { page,limit,search,stack,date } = req.query
            const parsedPage = parseInt(page as string, 10) || 1
            const parsedLimit = parseInt(limit as string, 10) || 3
            const parsedSearch: string = (req.query.search as string) || ''; 
            const parsedStack: string = (req.query.stack as string) || '';
            const parsedDate: string = (req.query.date as string) || ''; 
            const meetsData = await this.menteeService.getMeets(parsedPage, parsedLimit,parsedSearch,parsedStack,parsedDate)
            res.status(200).json({message:"Success",meetData:meetsData.meets,count:meetsData.totalCount})
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

    

    
    





    async checkIsBooked(req:Request,res:Response): Promise<void>{
        try{
            const bookingData = req.body
            const isBooked = await this.menteeService.checkIsBooked(bookingData)
            if(isBooked == false){
                res.status(200).json({message:"Success"})
            }else{
                res.status(409).json({message:" This slot is already booked."})
            }
            
        }catch(error){
            if(error instanceof Error){
                if(error.message == " This slot is already booked."){
                    res.status(409).json({message:" This slot is already booked."})
                }else{
                    console.log(error);
                    res.status(500).json({ message: "An error occurred while processing your request." });
                }
            }
        }
    }


    async getMenteeDetails(req:Request,res:Response):Promise<void>{
        try{
            const menteeId =  (req as any).mentee.id
            const menteeData = await this.menteeService.getMenteeDetails(menteeId)
            res.status(200).json(menteeData)
        }catch(error){
            if (error instanceof Error) {
                console.error( error.message);
                res.status(500).json({ message: error.message });
            } else {
                console.error('Unknown error during  mentee:', error);
                res.status(500).json({ message: 'Internal server error' });
            }
        }
    }

    async editProfile(req: Request, res: Response): Promise<void> {
        try {
            const { name } = req.body;
            const menteeId = (req as any).mentee.id;
            const menteeResponse = await this.menteeService.editProfile(name, menteeId);
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


    async createNewRefreshToken(req:Request,res:Response):Promise<void>{
        try{
            const { refreshToken } = req.body;
            if (!refreshToken) {
                throw new Error("Something went wrong please try again.")
            }
            const response = await this.menteeService.createNewRefreshToken(refreshToken)
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

    async changePassword(req:Request,res:Response): Promise<void>{
        try{
            const {oldPassword,newPassword} = req.body
            const menteeId = (req as any).mentee.id
            const updatePassword = await this.menteeService.changePassword(oldPassword,newPassword,menteeId)
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


    async  paymentMethod(req: Request, res: Response): Promise<void> {
        try {
            const { amount } = req.body;
            const amountInPaise = amount * 100; 
            if (amountInPaise < 50) {
                res.status(400).json({ message: "Amount must be at least 50 paise (0.50 INR)." });
                return;
            }
            const paymentIntent = await stripe.paymentIntents.create({
                amount: amountInPaise,
                currency: 'inr',
                payment_method_types: ['card'],
            });
            res.status(200).send({
                clientSecret: paymentIntent.client_secret,
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "An error occurred while processing your request." });
        }
    }

    async proceedPayment(req:Request,res:Response):Promise<void>{ 
        try{
            const accessToken = req.headers['authorization'] as string;
            const { sessionId } = req.body
            const bookSlot = await this.menteeService.proceedPayment(sessionId,accessToken)
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

    async walletPayment(req:Request,res:Response): Promise<void> {
        try{
            const menteeId = ( req as any).mentee.id
            const slotId = req.body.sessionId
            const bookSlot = await this.menteeService.walletPayment(menteeId,slotId)
            if(bookSlot){
                res.status(200).json({message:"Success"})
                return
            }
        }catch(error){
            if(error instanceof Error){
                if(error.message == "Slot is already booked"){
                    res.status(409).json({message:" This slot is already booked."})
                    return
                }else if(error.message == "insufficient balance"){
                    res.status(403).json({message:"insufficient balance"})
                    return
                }else{
                    res.status(500).json({ message: "An error occurred while processing your request." });
                    return
                }
            }else{
                res.status(500).json({ message: "An error occurred while processing your request." });
            }
        }
    }

    async addReview(req:Request,res:Response):Promise<void>{ 
        try{
            const menteeId = (req as any).mentee.id
            const formData = req.body.values
            const mentorId = req.body.slotId
            const review = await this.menteeService.addReview(menteeId,formData.rating,formData.comment,mentorId)
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

    async getNotifications(req:Request,res:Response):Promise<void>{ 
        try{
            const menteeId = (req as any).mentee.id
            const notifications = await this.menteeService.getNotifications(menteeId)
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
            const menteeId = (req as any).mentee.id
            const chatId = req.params.id as string
            const readChat = await this.menteeService.markReadChat(menteeId,chatId)
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

export default MenteeController;
