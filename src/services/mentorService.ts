import {
	IOtpVerify,
	TokenResponce,
} from "../interfaces/servicesInterfaces/IMentee";
import { IMentor } from "../models/mentorModel";
import MentorRepository from "../repositories/mentorRepository";
import { generateAccessToken, generateRefreshToken } from "../utils/jwtToken";
import { mentorPayload } from "../interfaces/commonInterfaces/tokenInterfaces";
import {
	EnhancedCommunityMeet,
	ICOmmunityFormData,
	IMentorLogin,
	ISlotMentor,
	ISlotsList,
	MentorVerification,
	MentorVerifyData,
	MentorVerifyFiles,
} from "../interfaces/servicesInterfaces/IMentor";
import HashedPassword from "../utils/hashedPassword";
import { ObjectId } from "mongoose";
import dotenv from "dotenv";
import jwt, { JwtPayload } from "jsonwebtoken";
import { IScheduleTime } from "../models/mentorTimeSchedule";
import { JWT_SECRET } from "../config/middilewareConfig";
import { IQa } from "../models/qaModel";

dotenv.config();

class MentorService {
	constructor(private mentorRepository: MentorRepository) {}

	async createMentor(
		mentorData: Partial<IMentor>
	): Promise<IMentor | undefined> {
		if (!mentorData.email) {
			throw new Error("Email is required to create a mentor.");
		}

		const existingMentor = await this.mentorRepository.findMentorByEmail(
			mentorData.email
		);
		if (existingMentor) {
			throw new Error("Mentor already exists.");
		}
		const mentorCreated = await this.mentorRepository.mentorRegister(
			mentorData
		);
		return mentorCreated;
	}

	async verifyOtp(otpData: Partial<IOtpVerify>): Promise<TokenResponce | null> {
		try {
			if (!otpData.email || !otpData.otp) {
				throw new Error("Email or OTP is missing");
			}
			const isOtpVerify = await this.mentorRepository.verifyOtp(
				otpData.email,
				otpData.otp
			);

			const mentorPayload: mentorPayload = {
				id: isOtpVerify.id,
				name: isOtpVerify.name,
				email: isOtpVerify.email,
				isActive: isOtpVerify.isActive,
			};

			const accessToken = await generateAccessToken(mentorPayload);
			const refreshToken = await generateRefreshToken(mentorPayload);
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

	async resendOtp(email: string): Promise<IMentor | undefined> {
		try {
			const resendOtpVerify = await this.mentorRepository.resendOtpVerify(
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

	async mentorLogin(
		mentorData: Partial<IMentorLogin>
	): Promise<TokenResponce | null | undefined> {
		if (!mentorData.email || !mentorData.password) {
			throw new Error("Email and password are required");
		}
		try {
			const mentorResponse = await this.mentorRepository.findMentorByEmail(
				mentorData.email
			);
			if (!mentorResponse) {
				throw new Error("User does not exist");
			}
			if (!mentorResponse.isActive) {
				throw new Error("Mentor is temporarily blocked.");
			}
			if (mentorResponse.password) {
				const isPasswordValid = await HashedPassword.comparePassword(
					mentorData.password,
					mentorResponse.password
				);
				if (isPasswordValid) {
					const userPayload: mentorPayload = {
						id: mentorResponse._id as ObjectId,
						name: mentorResponse.name,
						email: mentorResponse.email,
						isActive: mentorResponse.isActive,
					};
					let accessToken = generateAccessToken(userPayload);
					let refreshToken = generateRefreshToken(userPayload);
					return { accessToken, refreshToken };
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


	async resetWithEmail(email: string): Promise<IMentor | undefined> {
		try {
			const emailData = await this.mentorRepository.findMentorByEmail(email);
			if (!emailData) {
				throw new Error("Email does not exist.");
			}
	
			const savedEmailData = await this.mentorRepository.forgotPasswordWithEmail(emailData);
			return savedEmailData
		} catch (error) {
			console.error("Error in resetWithEmail:", error);
			throw new Error("Unable to reset password."); 
		}
	  }

	  async forgetPasswordVerifyOtp(otpData: Partial<IOtpVerify>) : Promise<IMentor | undefined>{
		try{
		  if (!otpData.email || !otpData.otp) {
			throw new Error("Email or OTP is missing");
		  }
		  const isOtpVerify = await this.mentorRepository.forgetPasswordVerifyOtp(
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
			throw new Error("otp is not matching")
		  } else {
			console.error("Error verifying OTP:", error);
			throw new Error("Unable to verify otp at this moment")
		  }
		}
	  }

	  async resetPassword(email:string,password:string): Promise<Boolean | undefined >{
		try{
		  const responseData = await this.mentorRepository.reserPassword(email,password)
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



	async isVerifiedMentor(accessToken: string): Promise<string | undefined> {
		try {
			if (accessToken.startsWith("Bearer ")) {
				accessToken = accessToken.split(" ")[1];
			}
			const decoded = jwt.verify(
				accessToken,
				process.env.ACCESS_TOKEN_PRIVATE_KEY as string
			) as JwtPayload;
			const { id } = decoded;
			const mentorData = await this.mentorRepository.isVerifiedMentor(id);
			return mentorData;
		} catch (error) {
			if (error instanceof Error) {
				console.error(error.message);
			} else {
				console.error("An unknown error occurred");
			}
			throw error;
		}
	}

	async verifyMentor(
        mentorData: MentorVerifyData,
        token: string
    ): Promise<boolean | undefined> {
        try {
            const tokenData = jwt.verify(
                token,
                process.env.ACCESS_TOKEN_PRIVATE_KEY as string
            ) as { id: string };

            const id = tokenData.id;
            return await this.mentorRepository.verifyMentorInDatabase(mentorData, id);
        } catch (error) {
            if (error instanceof Error) {
                console.error("Error verifying mentor:", error.message);
            } else {
                console.error("Unknown error during mentor verification:", error);
            }
            return false;
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
			const isMentor = await this.mentorRepository.findMentorBtId(id);
			if (!isMentor) {
				throw new Error("Mentor not found");
			}
			const userPayload: mentorPayload = {
				id: isMentor._id as ObjectId,
				name: isMentor.name,
				email: isMentor.email,
				isActive: isMentor.isActive,
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

	async scheduleTimeForMentor(
		scheduleData: IScheduleTime,
		accessToken: string
	): Promise<IScheduleTime | undefined> {
		try {
			if (accessToken.startsWith("Bearer ")) {
				accessToken = accessToken.split(" ")[1];
			}
			const decoded = jwt.verify(
				accessToken,
				JWT_SECRET as string
			) as JwtPayload;
			const { id } = decoded;
			const scheduleTime = await this.mentorRepository.scheduleTimeForMentor(
				scheduleData,
				id
			);
			return scheduleTime;
		} catch (error) {
			if (error instanceof Error) {
				console.error("Error schedule time :", error.message);
				throw new Error(error.message); 
			} else {
				console.error("Unknown error during scheduling time:", error);
			}
		}
	}

	async getScheduledSlots(accessToken:string): Promise< ISlotsList[] | undefined> {
		try {
			if (accessToken.startsWith("Bearer ")) {
				accessToken = accessToken.split(" ")[1];
			}
			const decoded = jwt.verify(
				accessToken,
				JWT_SECRET as string
			) as JwtPayload;
			const { id } = decoded;
			const getSlots = await this.mentorRepository.getScheduledSlots(id)
			return getSlots
		} catch (error) {
			if (error instanceof Error) {
				console.error(error.message);
			} else {
				console.error("An unknown error occurred");
			}
			throw error;
		}
	}

	async deleteScheduledSlot(id:string): Promise< boolean> {
		try {
			const deleteSlot = await this.mentorRepository.deleteScheduledSlot(id)
			if(deleteSlot){
				return true
			}else{
				return false
			}
		} catch (error) {
			if (error instanceof Error) {
				console.error(error.message);
				throw new Error(error.message)
			} else {
				console.error("An unknown error occurred");
			}
			throw error;
		}
	}


	async getBookedSlots(accessToken:string): Promise<ISlotMentor[]> {
		try {
			if(accessToken.startsWith("Bearer")){
				accessToken = accessToken.split(" ")[1]
			}
			const decoded = jwt.verify(accessToken,JWT_SECRET as string) as JwtPayload
			const {id} = decoded
			const getSlots = await this.mentorRepository.getBookedSlots(id)
			return getSlots 
		} catch (error) {
			if (error instanceof Error) {
				console.error(error.message);
			} else {
				console.error("An unknown error occurred");
			}
			throw error;
		}
	}

	async getMentorData(mentorId:string): Promise<MentorVerification> {
		try {
			const mentorData = await this.mentorRepository.getMentorData(mentorId)
			return mentorData as unknown as MentorVerification
		} catch (error) {
			if (error instanceof Error) {
				console.error(error.message);
			} else {
				console.error("An unknown error occurred");
			}
			throw error;
		}
	}

	async editProfile(name: string, mentorId: string, imageUrl?: string): Promise<void> {
		try {
			const mentorDataUpdate = await this.mentorRepository.updateMentor(name,mentorId, imageUrl);
		} catch (error) {
			if (error instanceof Error) {
				console.error(error.message);
			}
			throw new Error("An unexpected error occurred.");
		}
	}

	async changePassword(oldPassword:string,newPassword:string,mentorId:string): Promise<boolean> {
		try {
			const mentorData = await this.mentorRepository.findMentorBtId(mentorId)
			if(mentorData?.password){
				const isPasswordValid = await HashedPassword.comparePassword(
					oldPassword,
					mentorData.password
				)
				if(isPasswordValid){
					const changePassword = await this.mentorRepository.changePassword(mentorId,newPassword)
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

	async cancelSlot(slotId: string): Promise<void> {
		try {
			const cancelSlot = await this.mentorRepository.cancelSlot(slotId);
			return cancelSlot
		} catch (error) {
			if (error instanceof Error) {
				console.error(error.message);
			}
			throw new Error("An unexpected error occurred.");
		}
	}

	async allowConnection(bookedId: string): Promise<void> {
		try {
			const setConnection = await this.mentorRepository.allowConnection(bookedId);
			return 
		} catch (error) {
			if (error instanceof Error) {
				console.error(error.message);
			}
			throw new Error("An unexpected error occurred.");
		}
	}

	async endConnection(bookedId: string): Promise<void> {
		try {
			const endConnection = await this.mentorRepository.endConnection(bookedId);
			return 
		} catch (error) {
			if (error instanceof Error) {
				console.error(error.message);
			}
			throw new Error("An unexpected error occurred.");
		}
	}


	async getAllQuestions(mentorId:string): Promise<IQa[]> {
		try {
			const AllQuestions = await this.mentorRepository.getAllQuestions(mentorId);
			return AllQuestions
		} catch (error) {
			if (error instanceof Error) {
				console.error(error.message);
			}
			throw new Error("An unexpected error occurred.");
		}
	}

	async submitQAAnswer(questionId:string,mentorId:string,answer:string): Promise<void> {
		try {
			const submitAnswer = await this.mentorRepository.submitQAAnswer(questionId,mentorId,answer);
			return 
		} catch (error) {
			if (error instanceof Error) {
				console.error(error.message);
			}
			throw new Error("An unexpected error occurred.");
		}
	}

	async editQAAnswer(questionId:string,mentorId:string,answer:string): Promise<void> {
		try {
			const editAnswer = await this.mentorRepository.editQAAnswer(questionId,mentorId,answer);
			return 
		} catch (error) {
			if (error instanceof Error) {
				console.error(error.message);
			}
			throw new Error("An unexpected error occurred.");
		}
	}

	async createComminityMeet(formData:ICOmmunityFormData,mentorId:string,imageUrl:string): Promise<void> {
		try {
			const editAnswer = await this.mentorRepository.createComminityMeet(formData,mentorId,imageUrl);
			return 
		} catch (error) {
			if (error instanceof Error) {
				console.error(error.message);
			}
			throw new Error("An unexpected error occurred.");
		}
	}

	async getAllCommunityMeet(): Promise<EnhancedCommunityMeet[]> {
		try {
			const meetData = await this.mentorRepository.getAllCommunityMeet();
			return meetData
		} catch (error) {
			if (error instanceof Error) {
				console.error(error.message);
			}
			throw new Error("An unexpected error occurred.");
		}
	}

	async getMyCommunityMeet(mentorId:string): Promise<EnhancedCommunityMeet[]> {
		try {
			const meetData = await this.mentorRepository.getMyCommunityMeet(mentorId);
			return meetData
		} catch (error) {
			if (error instanceof Error) {
				console.error(error.message);
			}
			throw new Error("An unexpected error occurred.");
		}
	}


	async cancelCommunityMeet(meetId:string,about:string): Promise<void> {
		try {
			const cancelMeet = await this.mentorRepository.cancelCommunityMeet(meetId,about);
			return 
		} catch (error) {
			if (error instanceof Error) {
				console.error(error.message);
			}
			throw new Error("An unexpected error occurred.");
		}
	}
	
	
	
	
}

export default MentorService;
