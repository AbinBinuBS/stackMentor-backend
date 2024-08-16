import Mentee from "../models/menteeModel";
import TempModel, { IMentee } from "../models/tempRegister";
import HashedPassword from "../utils/hashedPassword";
import { generateOTP, sendVerifyMail } from "../utils/mail";

class MenteeRepository {
	async menteeRegister(
		menteeData: Partial<IMentee>
	): Promise<IMentee | undefined> {
		try {
			if (!menteeData.password) {
				throw new Error("Password is required");
			}
			if (!menteeData.email) {
				throw new Error("Email is required");
			}
			const hashedPassword = await HashedPassword.hashPassword(
				menteeData.password
			);
			const otp = generateOTP();
			await sendVerifyMail(menteeData.email, otp);

			const updateData = {
				...menteeData,
				password: hashedPassword,
				otp: otp,
				isActive: menteeData.isActive ?? false,
				isAdmin: menteeData.isAdmin ?? false,
			};

			const options = {
				new: true,
				upsert: true,
				setDefaultsOnInsert: true,
			};

			const updatedMentee = await TempModel.findOneAndUpdate(
				{ email: menteeData.email },
				updateData,
				options
			);
			return updatedMentee ?? undefined;
		} catch (error: any) {
			console.error(`Error in menteeRegister: ${error.message}`);
			throw new Error(`Unable to register mentee: ${error.message}`);
		}
	}

	async findMenteeByEmail(email: string): Promise<IMentee | null> {
		try {
			const menteeData = await Mentee.findOne({ email }).exec();
			return menteeData;
		} catch (error: any) {
			console.error(`Error in findMenteeByEmail: ${error.message}`);
			throw new Error(`Unable to find mentee: ${error.message}`);
		}
	}

	async verifyOtp(email: string, otp: string): Promise<IMentee> {
		try {
			const menteeData = await TempModel.findOne({ email });

			if (!menteeData) {
				throw new Error("Time has been expired");
			}

			if (menteeData.otp !== parseFloat(otp)) {
				throw new Error("Otp is not matching");
			}
			const newMentee = new Mentee({
				email: menteeData.email,
				name: menteeData.name,
				phone: menteeData.phone,
				password: menteeData.password,
				isActive: true,
				isAdmin: false,
			});

			const savedMentee = await newMentee.save();

			await TempModel.deleteOne({ email });

			return savedMentee;
		} catch (error: unknown) {
			if (error instanceof Error) {
				console.error(error.message);
			} else {
				console.log("an unknown error has been occured");
			}
			throw error;
		}
	}

	async resendOtpVerify(email: string): Promise<IMentee | null> {
		try {
			let otp = generateOTP();
			await sendVerifyMail(email, otp);
			const resetOtp = await TempModel.findOneAndUpdate(
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

	async forgotPasswordWithEmail(
		menteeData: IMentee
	): Promise<IMentee | undefined> {
		try {
			const otp = generateOTP();
			await sendVerifyMail(menteeData.email, otp);
			const updateData = {
				name: menteeData.name,
				email: menteeData.email,
				password: menteeData.password,
				phone: menteeData.phone,
				isActive: menteeData.isActive,
				isAdmin: menteeData.isAdmin,
				otp: otp,
			};
			const options = {
				new: true,
				upsert: true,
				setDefaultsOnInsert: true,
			};
			const updatedMentee = await TempModel.findOneAndUpdate(
				{ email: menteeData.email },
				updateData,
				options
			);
			return updatedMentee ?? undefined;
		} catch (error) {
			if (error instanceof Error) {
				console.error(error.message);
			} else {
				console.log("an unknown error has been occured");
			}
			throw error;
		}
	}

	async forgetPasswordVerifyOtp(email: string, otp: string): Promise<IMentee> {
		try {
			const menteeData = await TempModel.findOne({ email });
			if (!menteeData) {
				throw new Error("Time has been expired");
			}
			if (menteeData.otp !== parseFloat(otp)) {
				throw new Error("Otp is not matching");
			}
			await TempModel.deleteOne({ email });
			return menteeData;
		} catch (error: unknown) {
			if (error instanceof Error) {
				console.error("Data", error.message);
			} else {
				console.log("an unknown error has been occured");
			}
			throw error;
		}
	}

	async reserPassword(
		email: string,
		password: string
	): Promise<boolean | undefined> {
		try {
			const user = await Mentee.findOne({ email });

			if (!user) {
				console.error("User not found");
				return false;
			}
			const hashedPassword = await HashedPassword.hashPassword(password);

			user.password = hashedPassword;
			await user.save();

			return true;
		} catch (error) {
			if (error instanceof Error) {
				console.error(error.message);
			} else {
				console.log("an unknown error has been occured");
			}
			throw error;
		}
	}
}

export default MenteeRepository;
