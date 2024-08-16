import Mentor, { IMentor } from "../models/mentorModel";
import MentorTempModel, { IMentorSchema } from "../models/TempregisterMentor";
import HashedPassword from "../utils/hashedPassword";
import { generateOTP, sendVerifyMail } from "../utils/mail";

class MentorRepository {
	async mentorRegister(
		mentorData: Partial<IMentor>
	): Promise<IMentorSchema | undefined> {
		try {
			if (!mentorData.password) {
				throw new Error("Password is required");
			}
			if (!mentorData.email) {
				throw new Error("Email is required");
			}
			const hashedPassword = await HashedPassword.hashPassword(
				mentorData.password
			);
			const otp = generateOTP();
			await sendVerifyMail(mentorData.email, otp);

			const updateData = {
				...mentorData,
				password: hashedPassword,
				otp: otp,
				isActive: mentorData.isActive ?? false,
			};

			const options = {
				new: true,
				upsert: true,
				setDefaultsOnInsert: true,
			};

			const updatedMentor = await MentorTempModel.findOneAndUpdate(
				{ email: mentorData.email },
				updateData,
				options
			);
			return updatedMentor ?? undefined;
		} catch (error: any) {
			console.error(`Error in mentorRegister: ${error.message}`);
			throw new Error(`Unable to register mentor: ${error.message}`);
		}
	}

	async findMentorByEmail(email: string): Promise<IMentor | null> {
		try {
			const mentorData = await Mentor.findOne({ email }).exec();
			return mentorData;
		} catch (error: any) {
			console.error(`Error in findMentorByEmail: ${error.message}`);
			throw new Error(`Unable to find mentor: ${error.message}`);
		}
	}

	async verifyOtp(email: string, otp: string): Promise<IMentor> {
		try {
			const mentorData = await MentorTempModel.findOne({ email });

			if (!mentorData) {
				throw new Error("Time has been expired");
			}

			if (mentorData.otp !== parseFloat(otp)) {
				throw new Error("Otp is not matching");
			}
			const newMentor = new Mentor({
				email: mentorData.email,
				name: mentorData.name,
				password: mentorData.password,
				isActive: true,
				isAdmin: false,
			});

			const savedmentor = await newMentor.save();

			await MentorTempModel.deleteOne({ email });

			return savedmentor;
		} catch (error: unknown) {
			if (error instanceof Error) {
				console.error(error.message);
			} else {
				console.log("an unknown error has been occured");
			}
			throw error;
		}
	}

	async resendOtpVerify(email: string): Promise<IMentor | null> {
		try {
			let otp = generateOTP();
			await sendVerifyMail(email, otp);
			const resetOtp = await MentorTempModel.findOneAndUpdate(
				{ email },
				{ $set: { otp: otp } }
			);
			return resetOtp;
		} catch (error) {
			if (error instanceof Error) {
				console.error(error.message);
			} else {
				console.log("An unknown error has occurred");
			}
			throw error;
		}
	}
}
export default MentorRepository;
