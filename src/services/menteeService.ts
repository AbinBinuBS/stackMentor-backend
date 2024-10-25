import { IMentee } from "../models/menteeModel";
import HashedPassword from "../utils/hashedPassword";
import { generateAccessToken, generateRefreshToken } from "../utils/jwtToken";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "../config/middilewareConfig";
import { IQa } from "../models/qaModel";
import { INotification } from "../models/notificationModel";
import mongoose, { ObjectId } from "mongoose";
import ICheckIsBooked, { BookedSlot, ICombinedData, IMenteeLogin, IMentorShowcase, IOtpVerify, ISlot, TokenResponce, TokenwithCridential } from "../types/servicesInterfaces/IMentee";
import { userPayload } from "../types/commonInterfaces/tokenInterfaces";
import { EnhancedCommunityMeetCombined } from "../types/servicesInterfaces/IMentor";
import { IMenteeRepository } from "../interfaces/mentee/IMenteeRepository";
import { IMenteeService } from "../interfaces/mentee/IMenteeService";
import { generateOTP, sendVerifyMail } from "../utils/mail";

class MenteeService implements IMenteeService{
  constructor(private menteeRepository: IMenteeRepository) {}

  async createMentee(
    menteeData: Partial<IMentee>
  ): Promise<IMentee | undefined> {
    try{
      if (!menteeData.password) {
				throw new Error("Password is required");
			}
			if (!menteeData.email) {
				throw new Error("Email is required");
			}
			const hashedPassword = await HashedPassword.hashPassword(
				menteeData.password
			);
  
      const existingMentee = await this.menteeRepository.findMenteeByEmail(
        menteeData.email
      );
      if (existingMentee) {
        throw new Error("Mentee already exists.");
      }
      const otp = generateOTP();
      await sendVerifyMail(menteeData.email, otp);
      const userCreated = await this.menteeRepository.menteeRegister(menteeData,hashedPassword,otp);
      return userCreated;
    }catch(error){
      if (error instanceof Error) {
        console.error(error.message);
      } else {
        console.error("An unknown error occurred");
      }
      throw error;
    }
  }

  async googleRegister(name:string,email:string,password:string): Promise<TokenResponce | null> {
    try {
      const hashedPassword = await HashedPassword.hashPassword(
				password
			);
      const mentorData = await this.menteeRepository.googleRegister(name,email,password,hashedPassword);
      const userPayload = {
        id: mentorData.id,
        name: mentorData.name,
        phone: mentorData.phone,
        email: mentorData.email,
        isActive: mentorData.isActive,
        isAdmin: mentorData.isAdmin,
      };
      const accessToken = await generateAccessToken(userPayload);
      const refreshToken = await generateRefreshToken(userPayload);
      return { accessToken, refreshToken };
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
        return null;
      } else {
        console.error("Error verifying OTP:", error);
        return null;
      }
    }
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
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
      } else {
        console.error("An unknown error occurred");
      }
      throw error;
    }
  }

  async checkMenteeMail(email:string): Promise<TokenwithCridential | null | undefined> {
   
    try {
      const menteeResponse = await this.menteeRepository.findMenteeByEmail(
        email
      );
      if (!menteeResponse) {
        return {
          emailExists: false,
          message: "Email is not registered",
        };
      }
      if(!menteeResponse.isActive){
        throw new Error("User is blocked ");
      }
      const userPayload : userPayload = {
        id: menteeResponse.id,
        name: menteeResponse.name,
        phone: menteeResponse.phone,
        email: menteeResponse.email,
        isActive: menteeResponse.isActive,
        isAdmin: menteeResponse.isAdmin,
      };
      let accessToken = generateAccessToken(userPayload)
      let refreshToken = generateRefreshToken(userPayload)
      return {emailExists: true,accessToken,refreshToken,message: "Email is registered"}            
    } catch (error) {
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
      const menteeData = await this.menteeRepository.findTempModelWithEmail(otpData.email)
      if (!menteeData) {
				throw new Error("Time has been expired");
			}
      const isOtpVerify = await this.menteeRepository.verifyOtp(
        menteeData,
        otpData.otp
      );

      if (!isOtpVerify) {
        throw new Error("OTP verification failed");
      }
      await this.menteeRepository.removeTempData(otpData.email)
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
    } catch (error) {
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
      let otp = generateOTP();
			await sendVerifyMail(email, otp);
      const resendOtpVerify = await this.menteeRepository.resendOtpVerify(email,otp);
      if (!resendOtpVerify) {
        throw new Error("Time has been Expired Try again.");
      }
      return resendOtpVerify;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      } else {
        console.error("Error resending OTP:", error);
      }
    }
  }

  async resetWithEmail(email: string): Promise<IMentee | undefined> {
    try {
        const mentorData = await this.menteeRepository.findMenteeByEmail(email);
        if (!mentorData) {
            throw new Error("Email does not exist.");
        }
        const savedEmailData = await this.menteeRepository.forgotPasswordWithEmail(mentorData);
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
      await this.menteeRepository.findTempModelWithEmail(otpData.email)
      return isOtpVerify
    }catch(error){
      if (error instanceof Error) {
        console.error(error.message);
        throw new Error(error.message)
      } else {
        console.error("Error verifying OTP:", error);
        throw new Error("Unable to verify otp at this moment")
      }
    }
  }

  async resetPassword(email:string,password:string): Promise<Boolean | undefined >{
    try{
      const mentee = await this.menteeRepository.findMenteeByEmail(email)
      if (!mentee) {
        return false
      }
      const hashedPassword = await HashedPassword.hashPassword(password);
      const responseData = await this.menteeRepository.resetPassword(mentee,hashedPassword)
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


  async getMentors(level: string , stack:string): Promise<IMentorShowcase[]> {
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
      const mentorsData = await this.menteeRepository.getMentors(start , end,stack);
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
      const bookedSlots = await this.menteeRepository.bookedSlotsById(id)
      if (!bookedSlots) {
        throw new Error("Booked slot not found");
      }
      const objectId = new mongoose.Types.ObjectId(bookedSlots.slotId);
      const scheduledTime = await this.menteeRepository.scheduledSlotForMentee(objectId as unknown as mongoose.Schema.Types.ObjectId);
      if (!scheduledTime) {
        throw new Error("Associated schedule not found");
      }
     const slotsData:ISlot[] = await this.menteeRepository.getResheduleList(price,bookedSlots,scheduledTime)
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
      const oldBookedSlot = await this.menteeRepository.bookedSlotsById(oldId)
	  if (!oldBookedSlot) {
		throw new Error("Old booked slot not found");
	  }
  
	  const oldSchedule = await this.menteeRepository.scheduledSlotForMentee(
      oldBookedSlot.slotId as unknown as mongoose.Schema.Types.ObjectId
    );
    
	  if (!oldSchedule) {
		throw new Error("Old schedule time not found");
	  }
  
	  const newSchedule = await this.menteeRepository.scheduledSlotForMentee(newId as unknown as mongoose.Schema.Types.ObjectId)
	  if (!newSchedule) {
		throw new Error("New schedule time not found");
	  }
  
	  if (newSchedule.isBooked) {
		throw new Error("New schedule is already booked");
	  }

     const rescheduleSlot = await this.menteeRepository.rescheduleBooking(oldBookedSlot,oldSchedule,newSchedule)
     
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


  async getMenteeDetails(menteeId:string): Promise<IMentee | undefined> {
		try {
			const mentorData = await this.menteeRepository.findMenteeById(menteeId)
			return mentorData 
		} catch (error) {
			if (error instanceof Error) {
				console.error(error.message);
			} else {
				console.error("An unknown error occurred");
			}
			throw error;
		}
	}

  async editProfile(name: string, menteeId: string): Promise<void> {
		try {
			await this.menteeRepository.editProfile(name,menteeId);
		} catch (error) {
			if (error instanceof Error) {
				console.error(error.message);
			}
			throw new Error("An unexpected error occurred.");
		}
	}


  async createNewRefreshToken(
		refreshTokenData: string
	): Promise<TokenResponce> {
		try {
			const decoded = jwt.verify(
				refreshTokenData,
				process.env.REFRESH_TOKEN_PRIVATE_KEY as string
			) as JwtPayload;
			const { id } = decoded;
			const isMentee = await this.menteeRepository.findMenteeById(id);
			if (!isMentee) {
				throw new Error("Mentee not found");
			}
			const userPayload: userPayload = {
				id: isMentee._id as ObjectId,
				name: isMentee.name,
				email: isMentee.email,
				isActive: isMentee.isActive,
			};
			const accessToken = generateAccessToken(userPayload);
			const refreshToken = generateRefreshToken(userPayload);
			return { accessToken, refreshToken };
		} catch (error) {
			if (error instanceof Error) {
				console.log(error.message);
			}
			throw new Error("Failed to create new refresh token");
		}
	}

  async changePassword(oldPassword:string,newPassword:string,menteeId:string): Promise<boolean> {
		try {
			const menteeData = await this.menteeRepository.findMenteeById(menteeId)
			if(menteeData?.password){
				const isPasswordValid = await HashedPassword.comparePassword(
					oldPassword,
					menteeData.password
				)
				if(isPasswordValid){
          const hashedPassword = await HashedPassword.hashPassword(newPassword);
					const changePassword = await this.menteeRepository.changePassword(menteeId,hashedPassword)
					if(changePassword){
						return changePassword
					}else{
						throw new Error("an unexpected error happened please try again")
					}
				}else{
					throw new Error("password don't match")
				}
			}else{
				throw new Error("an unexpected error happened please try again")
			}
			
		} catch (error) {
			if (error instanceof Error) {
				console.error(error.message);
				throw new Error(error.message);
			}
			throw new Error("An unexpected error occurred.");
		}
	}

  async proceedPayment(sessionId:string,accessToken:string): Promise< boolean>{
    try{
      if (accessToken.startsWith("Bearer ")) {
				accessToken = accessToken.split(" ")[1];
			}
			const decoded = jwt .verify(accessToken,JWT_SECRET as string) as JwtPayload;
			const { id } = decoded;
      const bookSlot = await this.menteeRepository.proceedPayment(sessionId,id)
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

  async getWalletData(menteeId: string, page: number, limit: number): Promise<{ mentee: IMentee, total: number }> {
    try {
        const { mentee, total } = await this.menteeRepository.getWalletData(menteeId, page, limit);
        
        return { mentee, total };
    } catch (error) {
        if (error instanceof Error) {
            console.error(error.message);
            throw new Error(error.message);
        } else {
            console.error("Error fetching wallet data:", error);
            throw new Error("Unable to fetch wallet data at this moment.");
        }
    }
}


  async walletPayment(menteeId:string,slotId:string): Promise<boolean>{
    try{
      await this.menteeRepository.walletPayment(menteeId,slotId)
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

  async cancelSlot(slotId:string): Promise< void>{
    try{
      const bookedSlot = await this.menteeRepository.bookedSlotsById(slotId)
			if (!bookedSlot) {
				throw new Error('Booked slot not found');
			}
	
			const scheduleTime = await this.menteeRepository.scheduledSlotForMentee(bookedSlot.slotId as unknown as mongoose.Schema.Types.ObjectId)
			if (!scheduleTime) {
				throw new Error('Related schedule not found');
			}
      const mentee = await this.menteeRepository.findMenteeById(bookedSlot.userId as unknown as string)
      if (!mentee) {
				throw new Error(' mentee not found');
			}
      const slotData = await this.menteeRepository.cancelSlot(bookedSlot,scheduleTime,mentee)
      return slotData
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

  async qaQuestion(title:string,body:string,menteeId:string): Promise<void>{
    try{
      const postData = await this.menteeRepository.qaQuestion(title,body,menteeId)
      return postData
    }catch(error){
      if (error instanceof Error) {
        console.error(error.message);
        throw new Error(error.message)
      } else {
        console.error("error to fetch data:", error);
        throw new Error("Unable to post data at this moment.")
      }
    }
  }

  async getAllQuestions( page:number,search:string): Promise<{ questions: IQa[]; total: number }>{
    try{
      const limit =  5; 
      const total = await this.menteeRepository.countAllQa(search)
      const questions = await this.menteeRepository.getAllQuestions( page,search,limit)
      return { questions, total }
    }catch(error){
      if (error instanceof Error) {
        console.error(error.message);
        throw new Error(error.message)
      } else {
        console.error("error to fetch data:", error);
        throw new Error("Unable to post data at this moment.")
      }
    }
  }

  async getMeets(page:number,limit:number,search:string,stack:string,date:string): Promise<EnhancedCommunityMeetCombined> {
		try {
			const meetData = await this.menteeRepository.getMeets(page,limit,search,stack,date);
			return meetData
		} catch (error) {
			if (error instanceof Error) {
				console.error(error.message);
			}
			throw new Error("An unexpected error occurred.");
		}
	}

  async addReview(menteeId:string,rating:number,comment:string,mentorId:string): Promise<void> {
		try {
			const meetData = await this.menteeRepository.addReview(menteeId,rating,comment,mentorId);
		} catch (error) {
			if (error instanceof Error) {
				console.error(error.message);
			}
			throw new Error("An unexpected error occurred.");
		}
	}

  async getNotifications(menteeId:string): Promise<INotification[]> {
		try {
			const notifications = await this.menteeRepository.getNotifications(menteeId);
      return notifications
		} catch (error) {
			if (error instanceof Error) {
				console.error(error.message);
			}
			throw new Error("An unexpected error occurred.");
		}
	}

  async markReadChat(menteeId:string,chatId:string): Promise<void> {
		try {
			 await this.menteeRepository.markReadChat(menteeId,chatId);
		} catch (error) {
			if (error instanceof Error) {
				console.error(error.message);
			}
			throw new Error("An unexpected error occurred.");
		}
	}
  
}

export default MenteeService;



