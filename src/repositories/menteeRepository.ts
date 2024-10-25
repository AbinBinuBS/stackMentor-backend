import mongoose, { ObjectId, Types } from "mongoose";
import Mentee from "../models/menteeModel";
import ScheduleTime, { IScheduleTime } from "../models/mentorTimeSchedule";
import MentorVerifyModel from "../models/mentorValidate";
import TempModel, { IMentee } from "../models/tempRegister";
import HashedPassword from "../utils/hashedPassword";
import { generateOTP, sendVerifyMail } from "../utils/mail";
import BookedSlots, { IBookedSlots } from "../models/bookedSlots";
import { timeSheduleStatus } from "../constants/status";
import generateRoomId from "../helper/randomIdHelprt";
import QA, { IQa } from "../models/qaModel";
import CommunityMeet from "../models/communityMeetModel";
import Rating, { IRating } from "../models/ratingModel";
import NotificationModel, { INotification } from "../models/notificationModel";
import ICheckIsBooked, { BookedSlot, ICombinedData, IMentorShowcase, IMentorVerification, ISlot, ITransaction } from "../types/servicesInterfaces/IMentee";
import { EnhancedCommunityMeet, EnhancedCommunityMeetCombined } from "../types/servicesInterfaces/IMentor";
import { IMenteeRepository } from "../interfaces/mentee/IMenteeRepository";

class MenteeRepository implements IMenteeRepository {
	async menteeRegister(
		menteeData: Partial<IMentee>,hashedPassword:string,otp:string
	): Promise<IMentee | undefined> {
		try {
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
		} catch (error) {
			if (error instanceof Error) {
				console.error(error.message);
				throw new Error(error.message)
			} else {
				console.log("an unknown error has been occured");
				throw error;
			}
		}
	}

	async findMenteeByEmail(email: string): Promise<IMentee | null> {
		try {
			const menteeData = await Mentee.findOne({ email }).exec();
			return menteeData;
		} catch (error) {
			if (error instanceof Error) {
				console.error(error.message);
			} else {
				console.log("an unknown error has been occured");
			}
			throw error;
		}
	}

	async googleRegister(name:string,email:string,password:string,hashedPassword:string): Promise<IMentee> {
		try {
			const newMentee = new Mentee({
				email: email,
				name: name,
				phone: 1234567890,
				password: hashedPassword,
				isActive: true,
				isAdmin: false,
			});

			const savedMentee = await newMentee.save();
			return savedMentee;
		} catch (error) {
			if (error instanceof Error) {
				console.error(error.message);
			} else {
				console.log("an unknown error has been occured");
			}
			throw error;
		}
	}

	async findTempModelWithEmail(email: string): Promise<IMentee | null> {
		try {
			const menteeData = await TempModel.findOne({ email });
			return menteeData;
		} catch (error) {
			if (error instanceof Error) {
				console.error(error.message);
			} else {
				console.log("an unknown error has been occured");
			}
			throw error;
		}
	}

	async verifyOtp(menteeData: IMentee, otp: string): Promise<IMentee> {
		try {
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
			return savedMentee;
		} catch (error) {
			if (error instanceof Error) {
				console.error(error.message);
			} else {
				console.log("an unknown error has been occured");
			}
			throw error;
		}
	}

	async removeTempData(email: string): Promise<void> {
		try {
			await TempModel.deleteOne({ email });
		} catch (error) {
			if (error instanceof Error) {
				console.error(error.message);
			} else {
				console.log("an unknown error has been occured");
			}
			throw error;
		}
	}


	async resendOtpVerify(email: string,otp:string): Promise<IMentee | null> {
		try {
			
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

	async resetPassword(
		mentee:IMentee,hashedPassword:string
	): Promise<boolean | undefined> {
		try {
			mentee.password = hashedPassword;
			await mentee.save();
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
		end: number,
		stack:string
	): Promise<Array<IMentorShowcase>> {
		try {
			const mentorsData = await MentorVerifyModel.aggregate([
				{
					$match: { isVerified: true ,stack:stack},
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
		  const slotsData = await ScheduleTime.aggregate([
			{
			  $match: {
				mentorId: objectId,
				date: { $gte: tomorrow }, 
				isBooked:false
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
			  $lookup: {
				from: "bookedslots", 
				localField: "_id",
				foreignField: "slotId",
				as: "bookingInfo",
			  },
			},
			{
			  $unwind: {
				path: "$bookingInfo",
				preserveNullAndEmptyArrays: true, 
			  },
			},
			{
			  $match: {
				$or: [
				  { "bookingInfo.status": { $ne: "cancelled" } },
				  { "bookingInfo.status": { $exists: false } },  
				],
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
				"mentorVerification._id": { $ifNull: ["$mentorVerification._id", "N/A"] },
				"mentorVerification.name": { $ifNull: ["$mentorVerification.name", "N/A"] },
				"mentorVerification.image": { $ifNull: ["$mentorVerification.image", "N/A"] },
				"mentorVerification.yearsOfExperience": {
				  $ifNull: ["$mentorVerification.yearsOfExperience", "N/A"],
				},
				"bookingInfo.roomId": { $ifNull: ["$bookingInfo.roomId", "N/A"] },
				"bookingInfo.status": { $ifNull: ["$bookingInfo.status", "N/A"] },
			  },
			},
		  ]);
	  
		  const mentorVerification: IMentorVerification =
			slotsData.length > 0
			  ? slotsData[0].mentorVerification
			  : { name: "N/A", image: "N/A", yearsOfExperience: "N/A" };
			  const mentorId = mentorVerification._id
			  const reviewData = await Rating.find({ mentor: mentorId })
			  .populate('mentee', 'name')
			  .exec();
		  return {
			slots: slotsData as ISlot[],
			mentorVerification,
			ratings: reviewData as IRating[]
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

        const bookedSlots: BookedSlot[] = await BookedSlots.aggregate([
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(userId),
                    isExpired: false,   
                },
            },
            {
                $lookup: {
                    from: 'scheduletimes', 
                    localField: 'slotId',
                    foreignField: '_id',
                    as: 'scheduleData',
                },
            },
            {
                $unwind: '$scheduleData',
            },
            {
                $addFields: {
                    startDateTime: {
                        $dateFromParts: {
                            year: { $year: '$scheduleData.date' },
                            month: { $month: '$scheduleData.date' },
                            day: { $dayOfMonth: '$scheduleData.date' },
                            hour: {
                                $toInt: {
                                    $arrayElemAt: [{ $split: ['$scheduleData.startTime', ':'] }, 0],
                                },
                            },
                            minute: {
                                $toInt: {
                                    $arrayElemAt: [{ $split: ['$scheduleData.startTime', ':'] }, 1],
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
                    from: 'mentorvarifies', 
                    localField: 'scheduleData.mentorId',
                    foreignField: 'mentorId',
                    as: 'mentorData',
                },
            },
            {
                $unwind: '$mentorData',
            },
            {
                $project: {
                    date: '$scheduleData.date',
                    startTime: '$scheduleData.startTime',
                    endTime: '$scheduleData.endTime',
                    price: '$scheduleData.price',
                    'mentorData._id': 1,
                    'mentorData.name': 1,
                    'mentorData.image': 1,
                    startDateTime: 1,
					status:1,
					roomId:1,
					isAllowed:1
                },
            },
            {
                $sort: {
                    startDateTime: 1,
                },
            },
        ]);

        return bookedSlots;
    } catch (error) {
        if (error instanceof Error) {
            console.error('Error:', error.message);
        } else {
            console.log('An unknown error occurred');
        }
        throw error;
    }
}

async bookedSlotsById(id:string): Promise<IBookedSlots | null> {
	try {
		const bookedSlots = await BookedSlots.findById(id).exec();
		return bookedSlots
	} catch (error) {
		if (error instanceof Error) {
			console.error(error.message);
		} else {
			console.log("an unknown error has been occured");
		}
		throw error;
	}
}

async scheduledSlotForMentee(id:ObjectId): Promise<IScheduleTime | null> {
	try {
		const schedule = await ScheduleTime.findById(id).exec();
		return schedule
	} catch (error) {
		if (error instanceof Error) {
			console.error(error.message);
		} else {
			console.log("an unknown error has been occured");
		}
		throw error;
	}
}


async getResheduleList(price:number,bookedSlot: IBookedSlots, schedule: IScheduleTime): Promise<ISlot[]> {
	try {
		
		const mentorId = schedule.mentorId;
		const tomorrow = new Date();
		tomorrow.setDate(tomorrow.getDate() + 1);
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

async rescheduleBooking(oldBookedSlot:IBookedSlots,oldSchedule:IScheduleTime,newSchedule:IScheduleTime): Promise<boolean> {
	try {
	  oldSchedule.isBooked = false;
	  await oldSchedule.save();
  
	  newSchedule.isBooked = true;
	  await newSchedule.save();
  
	  oldBookedSlot.slotId = newSchedule._id as Types.ObjectId
	  await oldBookedSlot.save();
  
	  return true;
	} catch (error) {
	  if (error instanceof Error) {
		console.error("Error:", error.message);
	  } else {
		console.error("An unknown error occurred");
	  }
	  throw error;
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

	async editProfile(
		name: string,
		menteeId: string,
	  ): Promise<void> {
		try {
		  if (!Types.ObjectId.isValid(menteeId)) {
			throw new Error("Invalid menteeId provided.");
		  }
	  
		  const updatedMentor = await Mentee.findByIdAndUpdate(
			menteeId,
			{ name },
			{ new: true } 
		  );
	  
		  if (!updatedMentor) {
			throw new Error("mentee not found.");
		  }
		} catch (error) {
		  if (error instanceof Error) {
			console.error(error.message);
		  }
		  throw new Error("An unexpected error occurred.");
		}
	  }

	  async findMenteeById(id: string): Promise<IMentee | undefined> {
		try {
			const menteeData = await Mentee.findById({ _id: id });
			if (!menteeData) {
				throw new Error("mentor do not exist");
			}
			return menteeData;
		} catch (error) {
			if (error instanceof Error) {
				console.log(error.message);
			}
			throw new Error("An unexpected error occurred.");
		}
	}


	  async changePassword(menteeId: string, newPassword: string): Promise<boolean> {
		try {
		  const updatePassword = await Mentee.findByIdAndUpdate(
			menteeId, 
			{ password: newPassword }, 
			{ new: true } 
		  );
		  if (!updatePassword) {
			throw new Error('mentee not found');
		  }
		  return true
		} catch (error) {
		  if (error instanceof Error) {
			console.log(error.message);
		  }
		  throw new Error('An unexpected error occurred.');
		}
	  }

	async proceedPayment(
		scheduledId: string,
		userId: string
	  ): Promise<IScheduleTime | null> {
		try {
		  const schedule = await ScheduleTime.findById(scheduledId);
		  if (!schedule) {
			throw new Error("Schedule not found");
		  }
	  
		  if (schedule.isBooked) {
			throw new Error("Slot is already booked");
		  }
		  const roomId = await generateRoomId()
		  const bookedSlot = new BookedSlots({
			slotId: schedule._id, 
			userId: userId,
			status: timeSheduleStatus.CONFIRMED,
			roomId,
			isAttended: false,
			isExpired: false,
		  });
	  
		  const savedBookedSlot = await bookedSlot.save();
		  schedule.isBooked = true;
		  schedule.bookingId = savedBookedSlot._id as Types.ObjectId 
	  
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

	  async walletPayment(userId: string, slotId: string): Promise<IScheduleTime | null> {
		try {
			const schedule = await ScheduleTime.findById(slotId);
			if (!schedule) {
				throw new Error("Schedule not found");
			}
			if (schedule.isBooked) {
				throw new Error("Slot is already booked");
			}
			const walletBalance = await Mentee.findById(userId);
			if (!walletBalance || walletBalance.wallet === undefined) {
				throw new Error("Wallet balance not found");
			}
			if (walletBalance.wallet < schedule.price) {
				throw new Error("Insufficient balance");
			}
			const roomId = await generateRoomId();
			const bookedSlot = new BookedSlots({
				slotId: schedule._id,
				userId: userId,
				status: timeSheduleStatus.CONFIRMED,
				roomId,
				isAttended: false,
				isExpired: false,
			});
			const savedBookedSlot = await bookedSlot.save();
			schedule.isBooked = true;
			schedule.bookingId = savedBookedSlot._id as Types.ObjectId;
			walletBalance.wallet -= schedule.price;
			if (!walletBalance.walletHistory) {
				walletBalance.walletHistory = []; 
			}
			const transaction: ITransaction = {
				date: new Date(),
				description: `Booked slot for ${schedule.price}`, 
				amount: -schedule.price, 
				transactionType: 'debit',
				balanceAfterTransaction: walletBalance.wallet, 
			};
			walletBalance.walletHistory.push(transaction);
			await walletBalance.save();
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
	
	

	async getWalletData(menteeId: string, page: number, limit: number): Promise<{ mentee: IMentee, total: number }> {
		try {
			const walletData = await Mentee.findById(menteeId)
				.select('_id name wallet walletHistory')
				.exec();
	
			if (walletData) {
				const total = walletData.walletHistory ? walletData.walletHistory.length : 0;
	
				if (walletData.walletHistory) {
					walletData.walletHistory.reverse(); 
					const paginatedWalletHistory = walletData.walletHistory.slice((page - 1) * limit, page * limit);
					walletData.walletHistory = paginatedWalletHistory; 
				}
	
				return { mentee: walletData, total };
			} else {
				throw new Error("Mentee not found");
			}
		} catch (error) {
			if (error instanceof Error) {
				console.error("Error fetching data:", error.message);
				throw new Error(error.message);
			} else {
				console.error("Unknown error fetching data:", error);
				throw new Error("Unable to fetch data at this moment.");
			}
		}
	}
	
	
	async cancelSlot(bookedSlot:IBookedSlots,scheduleTime:IScheduleTime,mentee:IMentee): Promise<void> {
		try {
	
			if (bookedSlot.userId) {
				if (!mentee) {
					throw new Error('Mentee not found');
				}
	
				mentee.wallet = (mentee.wallet || 0) + scheduleTime.price;
	
				if (!mentee.walletHistory) {
					mentee.walletHistory = [];
				}
	
				const transaction: ITransaction = {
					date: new Date(),
					description: `Slot cancellation refund for ${scheduleTime.price}`, 
					amount: scheduleTime.price,
					transactionType: 'credit', 
					balanceAfterTransaction: mentee.wallet, 
				};
	
				mentee.walletHistory.push(transaction);
	
				await mentee.save();
			}
	
			const newScheduleTime = new ScheduleTime({
				date: scheduleTime.date,
				startTime: scheduleTime.startTime,
				endTime: scheduleTime.endTime,
				price: scheduleTime.price,
				mentorId: scheduleTime.mentorId,
				isBooked: false,
			});
	
			await newScheduleTime.save();
	
			bookedSlot.status = 'cancelled';
			await bookedSlot.save();
	
			scheduleTime.isBooked = false;
			await scheduleTime.save();
	
		} catch (error) {	
			if (error instanceof Error) {
				console.error('Error:', error.message);
			} else {
				console.log('An unknown error occurred');
			}
			throw error;
		}
	}
	


	  async qaQuestion(title:string,body:string,menteeId:string):Promise<void>{
		try{
			const qa = new QA({title,body,menteeId})
			await qa.save()
			return
		}catch(error){
			if (error instanceof Error) {
				console.error('Error:', error.message);
			  } else {
				console.log('An unknown error occurred');
			  }
			  throw error;
		}
	  }


	  async countAllQa(search: string):Promise<number>{
		try{
			const query = search
				? {
					$or: [
						{ title: { $regex: search, $options: 'i' } }, 
						{ 'menteeId.name': { $regex: search, $options: 'i' } },
						{ 'mentorId.name': { $regex: search, $options: 'i' } }
					]
				}
				: {};
	
			return await QA.countDocuments(query);
		}catch(error){
			if (error instanceof Error) {
				console.error('Error:', error.message);
			  } else {
				console.log('An unknown error occurred');
			  }
			  throw error;
		}
	  }

	  async getAllQuestions(page: number, search: string, limit: number): Promise< IQa[] > {
		try {
			const query = search
				? {
					$or: [
						{ title: { $regex: search, $options: 'i' } }, 
						{ 'menteeId.name': { $regex: search, $options: 'i' } },
						{ 'mentorId.name': { $regex: search, $options: 'i' } }
					]
				}
				: {};
		
			const questions: IQa[] = await QA.find(query)
				.populate('menteeId', 'name')
				.populate('mentorId', 'name')
				.skip((page - 1) * limit)
				.limit(limit);
	
			return questions
		} catch (error) {
			if (error instanceof Error) {
				console.error('Error:', error.message);
			} else {
				console.log('An unknown error occurred');
			}
			throw error;
		}
	}
	
	

	  async getMeets(page: number, limit: number, search: string, stack: string, date: string): Promise<EnhancedCommunityMeetCombined> {
		try {
			const today = new Date();
			today.setHours(0, 0, 0, 0);
	
			const query: any = {
				date: { $gte: today },
			};
	
			if (search) {
				query.about = { $regex: search, $options: 'i' };
			}
	
			if (stack) {
				query.stack = stack; 
			}
	
			if (date) {
				const selectedDate = new Date(date);
				query.date = selectedDate; 
			}
	
			const totalCount = await CommunityMeet.countDocuments(query).exec();
	
			const meetData = await CommunityMeet.find(query)
				.sort({ date: 1, startTime: 1 })
				.skip((page - 1) * limit) 
				.limit(limit) 
				.lean()
				.exec();
	
			const enhancedMeetData = await Promise.all(
				meetData.map(async (meet): Promise<EnhancedCommunityMeet> => {
					const mentorVerifyData = await MentorVerifyModel.findOne(
						{ mentorId: meet.mentorId },
						'name image' 
					)
						.lean()
						.exec();
	
					return {
						...meet,
						mentorInfo: mentorVerifyData
							? {
								name: mentorVerifyData.name,
								image: mentorVerifyData.image,
							}
							: undefined,
					};
				})
			);
			return {
				meets: enhancedMeetData, 
				totalCount: totalCount, 
			};
		} catch (error) {
			if (error instanceof Error) {
				console.log(error.message);
			}
			throw new Error(
				'An unexpected error occurred while fetching community meet data.'
			);
		}
	}
	
	
	
	  

	  async addReview(
		menteeId: string,
		rating: number,
		comment: string,
		mentorId: string
	  ): Promise<void> {
		try {
		  const alreadyRated = await Rating.findOne({ mentee: menteeId, mentor: mentorId });
		  
		  if (alreadyRated) {
			alreadyRated.ratingValue = rating;
			alreadyRated.comment = comment;
			await alreadyRated.save();
		  } else {
			const createNewRating = new Rating({
			  ratingValue: rating,
			  comment: comment,
			  mentee: menteeId,
			  mentor: mentorId,
			});
			await createNewRating.save();
		  }
		} catch (error) {
		  if (error instanceof Error) {
			console.error('Error:', error.message);
		  } else {
			console.log('An unknown error occurred');
		  }
		  throw error; 
		}
	  }
	  
	  async getNotifications(menteeId: string): Promise<INotification[]> {
		try {
			const notifications = await NotificationModel.find({ reciver: menteeId, read: false })
  			.sort({ createdAt: -1 });
			return notifications
		} catch (error) {
			if (error instanceof Error) {
				console.error("Error:", error.message);
			} else {
				console.log("An unknown error occurred");
			}
			throw error;
		}
	}

	async markReadChat(menteeId: string,chatId:string): Promise<void> {
		try {
			await NotificationModel.updateMany(
				{
				  chat: chatId,
				  reciver: menteeId,
				  read: false,
				},
				{
				  $set: { read: true },
				}
			  );
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
