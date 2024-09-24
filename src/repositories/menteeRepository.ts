import mongoose from "mongoose";
import ICheckIsBooked, {
	BookedSlot,
	ICombinedData,
	IMentorShowcase,
	IMentorVerification,
	ISlot,
} from "../interfaces/servicesInterfaces/IMentee";
import Mentee from "../models/menteeModel";
import Mentor from "../models/mentorModel";
import ScheduleTime, { IScheduleTime } from "../models/mentorTimeSchedule";
import MentorVerifyModel from "../models/mentorValidate";
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

	async getMentors(
		start: number,
		end: number
	): Promise<Array<IMentorShowcase>> {
		try {
			const mentorsData = await MentorVerifyModel.aggregate([
				{
					$match: { isVerified: true },
				},
				{
					$match: {
						yearsOfExperience: {
							$gte: start,
							...(end !== Infinity ? { $lt: end } : {}),
						},
					},
				},
				{
					$project: {
						_id: 1,
						name: 1,
						mentorId: 1,
						image: 1,
						about: 1,
						yearsOfExperience: 1,
					},
				},
			]);
			if (!mentorsData) {
				throw new Error("Something unexpected happened");
			}
			return mentorsData;
		} catch (error) {
			if (error instanceof Error) {
				console.error(error.message);
			} else {
				console.log("an unknown error has been occured");
			}
			throw error;
		}
	}

	async getMentorSlots(id: string): Promise<ICombinedData> {
		try {
			const objectId = new mongoose.Types.ObjectId(id);
			const tomorrow = new Date();
			tomorrow.setDate(tomorrow.getDate());
			const mentor = await MentorVerifyModel.find({ _id: id });
			if (!mentor) {
				throw new Error("internal server Error");
			}
			const slotsData = await ScheduleTime.aggregate([
				{
					$match: {
						mentorId: objectId,
						date: { $gte: tomorrow },
					},
				},
				{
					$lookup: {
						from: "mentorvarifies",
						localField: "mentorId",
						foreignField: "mentorId",
						as: "mentorVerification",
					},
				},
				{
					$unwind: {
						path: "$mentorVerification",
						preserveNullAndEmptyArrays: true,
					},
				},
				{
					$project: {
						_id: 1,
						date: 1,
						startTime: 1,
						endTime: 1,
						price: 1,
						isBooked: 1,
						mentorVerification: {
							name: { $ifNull: ["$mentorVerification.name", "N/A"] },
							image: { $ifNull: ["$mentorVerification.image", "N/A"] },
							yearsOfExperience: {
								$ifNull: ["$mentorVerification.yearsOfExperience", "N/A"],
							},
						},
					},
				},
			]);

			const mentorVerification: IMentorVerification =
				slotsData.length > 0
					? slotsData[0].mentorVerification
					: { name: "N/A", image: "N/A", yearsOfExperience: "N/A" };

			return {
				slots: slotsData as ISlot[],
				mentorVerification,
			};
		} catch (error) {
			if (error instanceof Error) {
				console.error("Error:", error.message);
			} else {
				console.log("An unknown error occurred");
			}
			throw error;
		}
	}

	async getBookedSlots(userId: string): Promise<BookedSlot[]> {
		try {
			const now = new Date();

			const bookedSlots: BookedSlot[] = await ScheduleTime.aggregate([
				{
					$match: {
						userId: new mongoose.Types.ObjectId(userId),
						isBooked: true,
					},
				},
				{
					$addFields: {
						startDateTime: {
							$dateFromParts: {
								year: { $year: "$date" },
								month: { $month: "$date" },
								day: { $dayOfMonth: "$date" },
								hour: {
									$toInt: {
										$arrayElemAt: [{ $split: ["$startTime", ":"] }, 0],
									},
								},
								minute: {
									$toInt: {
										$arrayElemAt: [{ $split: ["$startTime", ":"] }, 1],
									},
								},
								second: 0,
							},
						},
					},
				},
				{
					$match: {
						startDateTime: { $gte: now },
					},
				},
				{
					$lookup: {
						from: "mentorvarifies",
						localField: "mentorId",
						foreignField: "mentorId",
						as: "mentorData",
					},
				},
				{
					$unwind: "$mentorData",
				},
				{
					$project: {
						date: 1,
						startTime: 1,
						endTime: 1,
						price: 1,
						"mentorData._id": 1,
						"mentorData.name": 1,
						"mentorData.image": 1,
						startDateTime: 1,
					},
				},
				{
					$sort: {
						startDateTime: 1,
					},
				},
			]);
			console.log(bookedSlots);
			return bookedSlots;
		} catch (error) {
			if (error instanceof Error) {
				console.error("Error:", error.message);
			} else {
				console.log("An unknown error occurred");
			}
			throw error;
		}
	}

	async getResheduleList(id: string, price: number): Promise<ISlot[]> {
		try {
			const objectId = new mongoose.Types.ObjectId(id);

			const schedule = await ScheduleTime.findById(objectId).exec();

			if (!schedule) {
				throw new Error("Schedule not found");
			}

			const mentorId = schedule.mentorId;
			const tomorrow = new Date();
			tomorrow.setDate(tomorrow.getDate());

			const slotsData = await ScheduleTime.aggregate([
				{
					$match: {
						mentorId: mentorId,
						date: { $gte: tomorrow },
						isBooked: false,
						price: price,
					},
				},
				{
					$project: {
						_id: 1,
						date: 1,
						startTime: 1,
						endTime: 1,
						price: 1,
						isBooked: 1,
					},
				},
			]);

			console.log(slotsData);

			return slotsData as ISlot[];
		} catch (error) {
			if (error instanceof Error) {
				console.error("Error:", error.message);
			} else {
				console.log("An unknown error occurred");
			}
			throw error;
		}
	}

	async rescheduleBooking(oldId: string, newId: string): Promise<boolean> {
		const session = await ScheduleTime.startSession();
		session.startTransaction();
	  
		try {
		  const oldSchedule = await ScheduleTime.findById(oldId).session(session);
		  if (!oldSchedule) {
			throw new Error("Old schedule not found");
		  }
	  
		  const newSchedule = await ScheduleTime.findById(newId).session(session);
		  if (!newSchedule) {
			throw new Error("New schedule not found");
		  }
	  
		  const userId = oldSchedule.userId;
	  
		  oldSchedule.isBooked = false;
		  oldSchedule.userId = undefined;
		  await oldSchedule.save({ session });
	  
		  newSchedule.isBooked = true;
		  newSchedule.userId = userId;
		  await newSchedule.save({ session });
	  
		  await session.commitTransaction();
		  return true;
		} catch (error) {
		  await session.abortTransaction();
		  if (error instanceof Error) {
			console.error("Error:", error.message);
		  } else {
			console.error("An unknown error occurred");
		  }
		  throw error;
		} finally {
		  session.endSession();
		}
	  }
	  
	  
	  

	async checkIsBooked(bookingData: ICheckIsBooked): Promise<boolean> {
		try {
			const isBooked = await ScheduleTime.findById({
				_id: bookingData.sessionId,
			});
			if (!isBooked) {
				throw new Error("Unexpected error occured please try after sometime.");
			}
			return isBooked.isBooked;
		} catch (error) {
			if (error instanceof Error) {
				console.error("Error:", error.message);
			} else {
				console.log("An unknown error occurred");
			}
			throw error;
		}
	}

	async paymentMethod(
		scheduledId: string,
		userId: string
	): Promise<IScheduleTime | null> {
		try {
			const schedule = await ScheduleTime.findById(scheduledId);
			if (!schedule) {
				throw new Error("Schedule not found");
			}
			schedule.isBooked = true;
			schedule.userId = userId;
			const updatedSchedule = await schedule.save();

			return updatedSchedule;
		} catch (error) {
			if (error instanceof Error) {
				console.error("Error:", error.message);
			} else {
				console.log("An unknown error occurred");
			}
			throw error;
		}
	}
}

export default MenteeRepository;
