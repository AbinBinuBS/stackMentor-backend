import MenteeRepository from "../repositories/menteeRepository";
import Mentee, { IMentee } from "../models/menteeModel";
import HashedPassword from "../utils/hashedPassword";
import { userPayload } from "../interfaces/commonInterfaces/tokenInterfaces";
import ICheckIsBooked, {
  BookedSlot,
  ICombinedData,
  IMenteeLogin,
  IMentorShowcase,
  IOtpVerify,
  ISlot,
  TokenResponce,
} from "../interfaces/servicesInterfaces/IMentee";
import { generateAccessToken, generateRefreshToken } from "../utils/jwtToken";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "../config/middilewareConfig";

class MenteeService {
  constructor(private menteeRepository: MenteeRepository) {}

  async createMentee(
    menteeData: Partial<IMentee>
  ): Promise<IMentee | undefined> {
    if (!menteeData.email) {
      throw new Error("Email is required to create a mentee.");
    }

    const existingMentee = await this.menteeRepository.findMenteeByEmail(
      menteeData.email
    );
    if (existingMentee) {
      throw new Error("Mentee already exists.");
    }
    const userCreated = await this.menteeRepository.menteeRegister(menteeData);
    return userCreated;
  }

  async menteeLogin(menteeData: Partial<IMenteeLogin>): Promise<TokenResponce | null | undefined> {
    if (!menteeData.email || !menteeData.password) {
      throw new Error("Email and password are required");
    }
    try {
      const menteeResponse = await this.menteeRepository.findMenteeByEmail(
        menteeData.email
      );
      if (!menteeResponse) {
        throw new Error("User does not exist");
      }
      if(!menteeResponse.isActive){
        throw new Error("User is blocked ");
      }
      if (menteeResponse.password) {
          const isPasswordValid = await HashedPassword.comparePassword(
            menteeData.password,
            menteeResponse.password
          );
          if (isPasswordValid) {
            if(!menteeResponse.isAdmin){
              const userPayload : userPayload = {
                id: menteeResponse.id,
                name: menteeResponse.name,
                phone: menteeResponse.phone,
                email: menteeResponse.email,
                isActive: menteeResponse.isActive,
                isAdmin: menteeResponse.isAdmin,
              };
              console.log(userPayload)
              let accessToken = generateAccessToken(userPayload)
              let refreshToken = generateRefreshToken(userPayload)
              return {accessToken,refreshToken}
            }else{
              throw new Error("User does not exist.")
            }
          } else {
          throw new Error("Invalid password");
          }
      } else {
        throw new Error("Password is missing for the user");
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(error.message);
      } else {
        console.error("An unknown error occurred");
      }
      throw error;
    }
  }

  async verifyOtp(otpData: Partial<IOtpVerify>): Promise<TokenResponce | null> {
    try {
      if (!otpData.email || !otpData.otp) {
        throw new Error("Email or OTP is missing");
      }
      const isOtpVerify = await this.menteeRepository.verifyOtp(
        otpData.email,
        otpData.otp
      );

      if (!isOtpVerify) {
        throw new Error("OTP verification failed");
      }
      const userPayload = {
        id: isOtpVerify.id,
        name: isOtpVerify.name,
        phone: isOtpVerify.phone,
        email: isOtpVerify.email,
        isActive: isOtpVerify.isActive,
        isAdmin: isOtpVerify.isAdmin,
      };
      const accessToken = await generateAccessToken(userPayload);
      const refreshToken = await generateRefreshToken(userPayload);
      return { accessToken, refreshToken };
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(error.message);
        return null;
      } else {
        console.error("Error verifying OTP:", error);
        return null;
      }
    }
  }

  async resendOtp(email: string): Promise<IMentee | undefined> {
    try {
      const resendOtpVerify = await this.menteeRepository.resendOtpVerify(
        email
      );
      if (!resendOtpVerify) {
        throw new Error("Time has been Expired Try again.");
      }
      return resendOtpVerify;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw error;
      } else {
        console.error("Error resending OTP:", error);
      }
    }
  }

  async resetWithEmail(email: string): Promise<IMentee | undefined> {
    try {
        const emailData = await this.menteeRepository.findMenteeByEmail(email);
        if (!emailData) {
            throw new Error("Email does not exist.");
        }

        const savedEmailData = await this.menteeRepository.forgotPasswordWithEmail(emailData);
        return savedEmailData
    } catch (error) {
        console.error("Error in resetWithEmail:", error);
        throw new Error("Unable to reset password."); 
    }
  }

  async forgetPasswordVerifyOtp(otpData: Partial<IOtpVerify>) : Promise<IMentee | undefined>{
    try{
      if (!otpData.email || !otpData.otp) {
        throw new Error("Email or OTP is missing");
      }
      const isOtpVerify = await this.menteeRepository.forgetPasswordVerifyOtp(
        otpData.email,
        otpData.otp
      );

      if (!isOtpVerify) {
        throw new Error("OTP verification failed");
      }
      return isOtpVerify
    }catch(error){
      if (error instanceof Error) {
        console.error(error.message);
        throw new Error("Unable to verify otp at this moment")
      } else {
        console.error("Error verifying OTP:", error);
        throw new Error("Unable to verify otp at this moment")
      }
    }
  }

  async resetPassword(email:string,password:string): Promise<Boolean | undefined >{
    try{
      const responseData = await this.menteeRepository.reserPassword(email,password)
      if(responseData){
        return true
      }else{
        return false
      }
    }catch(error){
      if (error instanceof Error) {
        console.error(error.message);
        throw new Error("Unable to reset password at this moment.")
      } else {
        console.error("Error reseting password:", error);
        throw new Error("Unable to reset password at this moment.")
      }
    }
  }


  async getMentors(level: string): Promise<IMentorShowcase[]> {
    try {
      let start: number;
      let end: number;
      if (level === "beginner") {
        start = 5;
        end = 8;
      } else if (level === "intermediate") {
        start = 8;
        end = 10;
      } else {
        start = 10;
        end = Infinity; 
      }
      const mentorsData = await this.menteeRepository.getMentors(start , end);
      return mentorsData
  
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
        throw new Error("Unable to get mentors at this moment.");
      } else {
        console.error("Error getting mentors:", error);
        throw new Error("Unable to get mentors at this moment.");
      }
    }
  }

  async getMentorSlots(id:string): Promise<ICombinedData >{
    try{
     const slotsData:ICombinedData = await this.menteeRepository.getMentorSlots(id)
     return slotsData
    }catch(error){
      if (error instanceof Error) {
        console.error(error.message);
        throw new Error("Unable to fetch data at this moment.")
      } else {
        console.error("error to fetch data:", error);
        throw new Error("Unable to fetch data at this moment.")
      }
    }
  }


  async getBookedSlots(accessToken:string): Promise<BookedSlot[] >{
    try{
      if (accessToken.startsWith("Bearer ")) {
				accessToken = accessToken.split(" ")[1];
			}
			const decoded = jwt .verify(accessToken,JWT_SECRET as string) as JwtPayload;
			const { id } = decoded;
      const bookedSlot = await this.menteeRepository.getBookedSlots(id)
      return bookedSlot
    }catch(error){
      if (error instanceof Error) {
        console.error(error.message);
        throw new Error("Unable to fetch data at this moment.")
      } else {
        console.error("error to fetch data:", error);
        throw new Error("Unable to fetch data at this moment.")
      }
    }
  }




  async getResheduleList(id:string,price:number): Promise<ISlot[] >{
    try{
     const slotsData:ISlot[] = await this.menteeRepository.getResheduleList(id,price)
     return slotsData
    }catch(error){
      if (error instanceof Error) {
        console.error(error.message);
        throw new Error("Unable to fetch data at this moment.")
      } else {
        console.error("error to fetch data:", error);
        throw new Error("Unable to fetch data at this moment.")
      }
    }
  }

  
  async rescheduleBooking(oldId:string,newId:string): Promise<void >{
    try{
     const rescheduleSlot = await this.menteeRepository.rescheduleBooking(oldId,newId)
     
    }catch(error){
      if (error instanceof Error) {
        console.error(error.message);
        throw new Error("Unable to fetch data at this moment.")
      } else {
        console.error("error to fetch data:", error);
        throw new Error("Unable to fetch data at this moment.")
      }
    }
  }

  
  



  async checkIsBooked(bookingData:ICheckIsBooked): Promise< boolean>{
    try{
      const isBooked = await this.menteeRepository.checkIsBooked(bookingData)
      return isBooked
    }catch(error){
      if (error instanceof Error) {
        console.error(error.message);
        throw new Error(error.message)
      } else {
        console.error("error to fetch data:", error);
        throw new Error("Unable to fetch data at this moment.")
      }
    }
  }

  async paymentMethod(sessionId:string,accessToken:string): Promise< boolean>{
    try{
      if (accessToken.startsWith("Bearer ")) {
				accessToken = accessToken.split(" ")[1];
			}
			const decoded = jwt .verify(accessToken,JWT_SECRET as string) as JwtPayload;
			const { id } = decoded;
      const bookSlot = await this.menteeRepository.paymentMethod(sessionId,id)
      return true
    }catch(error){
      if (error instanceof Error) {
        console.error(error.message);
        throw new Error(error.message)
      } else {
        console.error("error to fetch data:", error);
        throw new Error("Unable to fetch data at this moment.")
      }
    }
  }


  
}

export default MenteeService;



