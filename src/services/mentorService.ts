import {
	IOtpVerify,
	TokenResponce,
} from "../interfaces/servicesInterfaces/IMentee";
import { IMentor } from "../models/mentorModel";
import MentorRepository from "../repositories/mentorRepository";
import { generateAccessToken, generateRefreshToken } from "../utils/jwtToken";
import { mentorPayload } from "../interfaces/commonInterfaces/tokenInterfaces";
import { IMentorLogin } from "../interfaces/servicesInterfaces/IMentor";
import HashedPassword from "../utils/hashedPassword";

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

			if (!isOtpVerify) {
				throw new Error("OTP verification failed");
			}
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

	async mentorLogin(mentorData: Partial<IMentorLogin>): Promise<TokenResponce | null | undefined> {
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
		  if (mentorResponse.password) {
			  const isPasswordValid = await HashedPassword.comparePassword(
				mentorData.password,
				mentorResponse.password
			  );
			  if (isPasswordValid) {
				  const userPayload : mentorPayload = {
					id: mentorResponse.id,
					name: mentorResponse.name,
					email: mentorResponse.email,
					isActive: mentorResponse.isActive,
				  };
				  console.log(userPayload)
				  let accessToken = generateAccessToken(userPayload)
				  let refreshToken = generateRefreshToken(userPayload)
				  return {accessToken,refreshToken}
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
}

export default MentorService;
