import MenteeRepository from "../repositories/menteeRepository";
import Mentee, { IMentee } from "../models/menteeModel";
import HashedPassword from "../utils/hashedPassword";
import { userPayload } from "../interfaces/commonInterfaces/tokenInterfaces";
import {
  IMenteeLogin,
  IOtpVerify,
  TokenResponce,
} from "../interfaces/servicesInterfaces/IMentee";
import { generateAccessToken, generateRefreshToken } from "../utils/jwtToken";

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
}

export default MenteeService;
