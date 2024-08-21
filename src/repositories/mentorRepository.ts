import {
	ISlotsList,
	MentorVerifyData,
} from "../interfaces/servicesInterfaces/IMentor";
import Mentor, { IMentor } from "../models/mentorModel";
import ScheduleTime, { IScheduleTime } from "../models/mentorTimeSchedule";
import MentorVerifyModel from "../models/mentorValidate";
import MentorTempModel, { IMentorSchema } from "../models/tempregisterMentor";
import HashedPassword from "../utils/hashedPassword";
import { generateOTP, sendVerifyMail } from "../utils/mail";
import mongoose from "mongoose";
import { Types } from 'mongoose'; 

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
				isVerified: "beginner",
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


	async forgotPasswordWithEmail(
		mentorData: IMentor
	): Promise<IMentor | undefined> {
		try {
			const otp = generateOTP();
			await sendVerifyMail(mentorData.email, otp);
			const updateData = {
				name: mentorData.name,
				email: mentorData.email,
				password: mentorData.password,
				isActive: mentorData.isActive,
				otp: otp,
			};
			const options = {
				new: true,
				upsert: true,
				setDefaultsOnInsert: true,
			};
			const updatedMentee = await MentorTempModel.findOneAndUpdate(
				{ email: mentorData.email },
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

	async forgetPasswordVerifyOtp(email: string, otp: string): Promise<IMentor> {
		try {
			const mentorData = await MentorTempModel.findOne({ email });
			if (!mentorData) {
				throw new Error("Time has been expired");
			}
			if (mentorData.otp !== parseFloat(otp)) {
				throw new Error("Otp is not matching");
			}
			await MentorTempModel.deleteOne({ email });
			return mentorData;
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
			const mentor = await Mentor.findOne({ email });
			if (!mentor) {
				console.error("Mentor not found");
				return false;
			}
			const hashedPassword = await HashedPassword.hashPassword(password);

			mentor.password = hashedPassword;
			await mentor.save();

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

	async isVerifiedMentor(id: string): Promise<string | undefined> {
		try {
			const mentorData = await Mentor.findById({ _id: id });
			console.log(mentorData);
			return mentorData?.isVerified;
		} catch (error) {
			if (error instanceof Error) {
				console.error(error.message);
			} else {
				console.log("An unknown error has occurred");
			}
			throw error;
		}
	}

	async verifyMentor(
		mentorData: MentorVerifyData,
		id: string
	): Promise<boolean | undefined> {
		try {
			const userData = await Mentor.findByIdAndUpdate(
				{ _id: id },
				{ $set: { isVerified: "applied" } },
				{ new: true }
			).exec();
			if (!mentorData || !id) {
				throw new Error(
					"Not able to verify your account now, please try again after sometime."
				);
			}
			const verifyMentorData = new MentorVerifyModel({
				mentorId: userData ? userData._id : undefined,
				name: mentorData.name,
				dateOfBirth: mentorData.dateOfBirth,
				preferredLanguage: mentorData.preferredLanguage,
				email: mentorData.email,
				degree: mentorData.degree,
				college: mentorData.college,
				yearOfGraduation: mentorData.yearOfGraduation,
				jobTitle: mentorData.jobTitle,
				lastWorkedCompany: mentorData.lastWorkedCompany,
				yearsOfExperience: mentorData.yearsOfExperience,
				stack: mentorData.stack,
				resume: mentorData.fileUrls.resume,
				degreeCertificate: mentorData.fileUrls.degreeCertificate,
				experienceCertificate: mentorData.fileUrls.experienceCertificate,
				isVerified: false,
			});
			await verifyMentorData.save();
			if (verifyMentorData) {
				return true;
			} else {
				return false;
			}
		} catch (error) {
			if (error instanceof Error) {
				console.log(error.message);
			}
		}
	}

	async findMentorBtId(id: string): Promise<IMentor | undefined> {
		try {
			const mentorData = await Mentor.findById({ _id: id });
			if (!mentorData) {
				throw new Error("Mentor do not exist");
			}
			return mentorData;
		} catch (error) {
			if (error instanceof Error) {
				console.log(error.message);
			}
		}
	}

	async scheduleTimeForMentor(
		scheduleData: IScheduleTime,
		image: string,
		id: string
	): Promise<IScheduleTime | undefined> {
		try {
			const existingScheduledTime = await ScheduleTime.findOne({
				mentorId: id,
				date: scheduleData.date,
				$or: [
					{
						startTime: { $lte: scheduleData.endTime },
						endTime: { $gte: scheduleData.startTime },
					},
				],
			});

			if (existingScheduledTime) {
				throw new Error("The time slot overlaps with an existing schedule.");
			}

			const isTimeScheduled = new ScheduleTime({
				date: scheduleData.date,
				startTime: scheduleData.startTime,
				endTime: scheduleData.endTime,
				price: scheduleData.price,
				category: scheduleData.category,
				about: scheduleData.about,
				image: image,
				mentorId: id,
			});

			await isTimeScheduled.save();

			return isTimeScheduled;
		} catch (error) {
			if (error instanceof Error) {
				console.log(error.message);
				throw new Error(error.message);
			}
			throw new Error("An unexpected error occurred.");
		}
	}

	async getScheduledSlots(id: string): Promise<Array<ISlotsList> | undefined> {
		try {
			const today = new Date();
			today.setHours(0, 0, 0, 0);
			const scheduledDatas = await ScheduleTime.aggregate([
				{
					$match: {
						mentorId: new mongoose.Types.ObjectId(id),
						date: { $gte: today },
					},
				},
				{
					$project: {
						_id: 1,
						date: 1,
						startTime: 1,
						endTime: 1,
					},
				},
			]);

			return scheduledDatas;
		} catch (error) {
			if (error instanceof Error) {
				console.log(error.message);
			}
		}
	}

	async deleteScheduledSlot(id: string): Promise<boolean> {
		if (!Types.ObjectId.isValid(id)) {
			console.error("Invalid ID format");
			return false;
		}

		try {
			const slotData = await ScheduleTime.findByIdAndDelete(id);
			if (!slotData) {
				console.error("No slot found with the given ID");
				return false;
			}
			return true;
		} catch (error) {
			if (error instanceof Error) {
				console.error(error.message); 
			}
			return false;
		}
	}
}
export default MentorRepository;
