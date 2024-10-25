
import Mentor, { IMentor } from "../models/mentorModel";
import ScheduleTime, { IScheduleTime } from "../models/mentorTimeSchedule";
import MentorVerifyModel, { IMentorVerify } from "../models/mentorValidate";
import MentorTempModel, { IMentorSchema } from "../models/tempregisterMentor";
import HashedPassword from "../utils/hashedPassword";
import { generateOTP, sendVerifyMail } from "../utils/mail";
import mongoose ,{ObjectId}from "mongoose";
import { Types } from 'mongoose'; 
import { timeSheduleStatus } from "../constants/status";
import Mentee from "../models/menteeModel";
import BookedSlots from "../models/bookedSlots";
import QA, { IQa } from "../models/qaModel";
import CommunityMeet, { ICommunityMeet } from "../models/communityMeetModel";
import CommunityRoomId from "../helper/communityMeetHelper";
import Rating, { IRating } from "../models/ratingModel";
import NotificationModel, { INotification } from "../models/notificationModel";
import { EnhancedCommunityMeet, ICOmmunityFormData, ISlotMentor, ISlotsList, MentorVerification, MentorVerifyData, RatingCounts, RatingResponse } from "../types/servicesInterfaces/IMentor";
import { ITransaction } from "../types/servicesInterfaces/IMentee";
import { IMentorRepository } from "../interfaces/mentor/IMentorRepository";




class MentorRepository implements IMentorRepository{
	async mentorRegister(
		mentorData: Partial<IMentor>,hashedPassword:string,otp:string
	): Promise<IMentorSchema | undefined> {
		try {
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

	async findMentorTempByEmail(email: string): Promise<IMentorSchema | null> {
		try {
			const mentorData = await MentorTempModel.findOne({ email });
			return mentorData;
		} catch (error: any) {
			console.error(`Error in findMentorByEmail: ${error.message}`);
			throw new Error(`Unable to find mentor: ${error.message}`);
		}
	}
	

	async verifyOtp(mentorData:IMentorSchema): Promise<IMentor> {
		try {
			const newMentor = new Mentor({
				email: mentorData.email,
				name: mentorData.name,
				password: mentorData.password,
				isActive: true,
				isAdmin: false,
				isVerified: "beginner",
			});

			const savedmentor = await newMentor.save();
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

	async removeTempMentor(email: string): Promise<void> {
		try {
			await MentorTempModel.deleteOne({ email });
		} catch (error: any) {
			console.error(`Error in  ${error.message}`);
			throw new Error(`Unable  ${error.message}`);
		}
	}

	async resendOtpVerify(email: string,otp:string): Promise<IMentor | null> {
		try {
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
		mentorData: IMentor,otp:string
	): Promise<IMentor | undefined> {
		try {
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

	async resetPassword(
		mentor:IMentor,hashedPassword:string
	): Promise<boolean | undefined> {
		try {
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

	async verifyMentorInDatabase(
        mentorData: MentorVerifyData,
        id: string
    ): Promise<boolean> {
        try {
            const userData = await Mentor.findByIdAndUpdate(
                { _id: id },
                { $set: { isVerified: "applied" } },
                { new: true }
            ).exec();

            if (!mentorData || !id) {
                throw new Error("Cannot verify your account now, please try again later.");
            }

            const experience = parseInt(mentorData.yearsOfExperience);

            const verifyMentorData = new MentorVerifyModel({
                mentorId: userData ? userData._id : undefined,
                name: mentorData.name,
                dateOfBirth: mentorData.dateOfBirth,
                about: mentorData.about,
                jobTitle: mentorData.jobTitle,
                lastWorkedCompany: mentorData.lastWorkedCompany,
				yearOfGraduation:mentorData.yearOfGraduation,
				college:mentorData.college,
				degree:mentorData.degree,
                yearsOfExperience: experience,
                stack: mentorData.stack,
                resume: mentorData.fileUrls.resume,
                degreeCertificate: mentorData.fileUrls.degreeCertificate,
                experienceCertificate: mentorData.fileUrls.experienceCertificate,
                image: mentorData.fileUrls.image, 
                isVerified: false,
            });

            await verifyMentorData.save();

            return true;
        } catch (error) {
            if (error instanceof Error) {
                console.error(error.message);
            }
            return false; 
        }
    }

	async findMentorById(id: string): Promise<IMentor | undefined> {
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
			throw new Error("An unexpected error occurred.");
		}
	}

	async findOverlappingSchedule(
		mentorId: string,
		occurrenceDate: Date,
		startTime: string,
		endTime: string
	): Promise<IScheduleTime | null> {
		try{
			const startDateTime = new Date(`${occurrenceDate.toISOString().split('T')[0]}T${startTime}`);
			const endDateTime = new Date(`${occurrenceDate.toISOString().split('T')[0]}T${endTime}`);
	
			const existingSchedule = await ScheduleTime.findOne({
				mentorId,
				date: occurrenceDate,
				$or: [
					{
						startTime: { $lt: endDateTime },
						endTime: { $gt: startDateTime },
					},
				],
			});
	
			return existingSchedule; 
		}catch(error){
			if (error instanceof Error) {
				console.log(error.message);
			}
			throw new Error("An unexpected error occurred.");
		}
	}

	async getScheduledSlots(id: string, page: number, limit: number, date?: string): Promise<{ totalCount: number; slots: Array<ISlotsList> } | undefined> {
		try {
			const today = new Date();
			today.setHours(0, 0, 0, 0);
	
			let startOfDay: Date | null = null;
			let endOfDay: Date | null = null;
			if (date) {
				startOfDay = new Date(date);
				startOfDay.setHours(0, 0, 0, 0);
				endOfDay = new Date(date);
				endOfDay.setHours(23, 59, 59, 999); 
			}
	
			const matchCriteria: any = {
				mentorId: new mongoose.Types.ObjectId(id),
			};
	
			if (startOfDay && endOfDay) {
				matchCriteria.date = {
					$gte: startOfDay,
					$lte: endOfDay,
				};
			} else {
				matchCriteria.date = { $gte: today };
			}
	
			const result = await ScheduleTime.aggregate([
				{
					$match: matchCriteria,
				},
				{
					$lookup: {
						from: 'bookedslots',
						localField: '_id',
						foreignField: 'slotId',
						as: 'bookedSlots',
					},
				},
				{
					$facet: {
						totalCount: [
							{ $count: 'count' } 
						],
						slots: [
							{ $skip: (page - 1) * limit },
							{ $limit: limit },
						],
					},
				},
				{
					$unwind: {
						path: "$totalCount",
						preserveNullAndEmptyArrays: true, 
					},
				},
				{
					$project: {
						totalCount: { $ifNull: ["$totalCount.count", 0] },
						slots: "$slots",
					},
				},
			]);
	
			return {
				totalCount: result.length > 0 ? result[0].totalCount : 0,
				slots: result.length > 0 ? result[0].slots : [],
			};
		} catch (error) {
			if (error instanceof Error) {
				console.log(error.message);
			}
			throw new Error("An unexpected error occurred.");
		}
	}
	
	
	

	async findScheduleById(id: string): Promise<IScheduleTime | null> {
		try {
			const slotData = await ScheduleTime.findById(id);
			return slotData;
		} catch (error) {
			if (error instanceof Error) {
				console.log(error.message);
			}
			throw new Error("An unexpected error occurred.");
		}
	}

	async deleteScheduledSlot(id: string): Promise<boolean> {
		try {
			const removeSlot = await ScheduleTime.findByIdAndDelete(id);
			return true;
		} catch (error) {
			if (error instanceof Error) {
				console.error(error.message); 
				throw new Error(error.message)
			}
			throw new Error("An unexpected error occurred.");
		}
	}

	
	async getBookedSlots(id: string, page: number, limit: number): Promise<{ slots: ISlotMentor[], totalCount: number }> {
		try {
			const objectId = new mongoose.Types.ObjectId(id);
			const today = new Date();
			today.setHours(0, 0, 0, 0);
	
			const bookedSlotsData = await ScheduleTime.aggregate([
				{
					$match: {
						mentorId: objectId,
						isBooked: true,
						date: { $gte: today },
					},
				},
				{
					$lookup: {
						from: 'bookedslots',
						localField: '_id',
						foreignField: 'slotId',
						as: 'bookingData',
					},
				},
				{
					$unwind: {
						path: '$bookingData',
						preserveNullAndEmptyArrays: true,
					},
				},
				{
					$project: {
						date: 1,
						startTime: 1,
						endTime: 1,
						price: 1,
						isBooked: 1,
						'bookingData._id': 1,
						'bookingData.roomId': 1,
						'bookingData.userId': 1,
						'bookingData.status': 1,
						'bookingData.isAllowed': 1,
					},
				},
				{
					$facet: {
						slots: [
							{
								$sort: {
									date: 1,
									startTime: 1,
								},
							},
							{
								$skip: (page - 1) * limit,
							},
							{
								$limit: limit, 
							},
						],
						totalCount: [
							{
								$count: 'count', 
							},
						],
					},
				},
				{
					$unwind: {
						path: '$totalCount',
						preserveNullAndEmptyArrays: true,
					},
				},
				{
					$project: {
						slots: '$slots',
						totalCount: { $ifNull: ['$totalCount.count', 0] }, 
					},
				},
			]);
	
			return {
				slots: bookedSlotsData[0]?.slots || [], 
				totalCount: bookedSlotsData[0]?.totalCount || 0,
			};
		} catch (error) {
			if (error instanceof Error) {
				console.log(error.message);
			}
			throw new Error("An unexpected error occurred.");
		}
	}
	

	async getMentorData(mentorId: string): Promise<MentorVerification | undefined> {
		try {
			const mentorData = await MentorVerifyModel.findOne({mentorId}).populate('mentorId');
			if(mentorData){
				return mentorData as unknown as MentorVerification
			}
			throw new Error("An unexpected error occurred.")
		} catch (error) {
			if (error instanceof Error) {
				console.log(error.message);
			}
			throw new Error("An unexpected error occurred.");
		}
	}

	async updateMentor(
		name: string,
		mentorId: string,
		imageUrl?: string
	  ): Promise<void> {
		try {
		  const updatedMentor = await Mentor.findByIdAndUpdate(
			mentorId,
			{ name },
			{ new: true } 
		  );
	  
		  if (!updatedMentor) {
			throw new Error("Mentor not found.");
		  }
		} catch (error) {
		  if (error instanceof Error) {
			console.error(error.message);
		  }
		  throw new Error("An unexpected error occurred.");
		}
	  }

	  async updateMentorVerify(
		name: string,
		mentorId: string,
		imageUrl?: string
	  ): Promise<void> {
		try {
		  const updatedMentorVerify = await MentorVerifyModel.findOneAndUpdate(
			{ mentorId },
			{
			  name,
			  ...(imageUrl && { image: imageUrl }) 
			},
			{ new: true } 
		  );
	  
		  if (!updatedMentorVerify) {
			throw new Error("Mentor verification data not found.");
		  }
		} catch (error) {
		  if (error instanceof Error) {
			console.error(error.message);
		  }
		  throw new Error("An unexpected error occurred.");
		}
	  }


	  async changePassword(mentorId: string, newPassword: string): Promise<boolean> {
		try {
		  const updatePassword = await Mentor.findByIdAndUpdate(
			mentorId, 
			{ password: newPassword }, 
			{ new: true } 
		  );
		  if (!updatePassword) {
			throw new Error('Mentor not found');
		  }
		  return true
		} catch (error) {
		  if (error instanceof Error) {
			console.log(error.message);
		  }
		  throw new Error('An unexpected error occurred.');
		}
	  }


	  async cancelSlot(slotId: string): Promise<void> {
		const session = await mongoose.startSession();
		session.startTransaction();
	
		try {
			const scheduleTime = await ScheduleTime.findById(slotId).session(session);
			if (!scheduleTime) {
				throw new Error('Scheduled slot not found');
			}
	
			const bookedSlot = await BookedSlots.findOne({ slotId: scheduleTime._id }).session(session);
			if (!bookedSlot) {
				throw new Error('No booked slot found for this scheduled time');
			}
	
			if (bookedSlot.userId) {
				const mentee = await Mentee.findById(bookedSlot.userId).session(session);
				if (!mentee) {
					throw new Error('Mentee not found');
				}
				mentee.wallet = (mentee.wallet || 0) + scheduleTime.price;
				if (!mentee.walletHistory) {
					mentee.walletHistory = [];
				}
				const transaction: ITransaction = {
					date: new Date(), 
					description: `Slot cancellation refund by mentor for ${scheduleTime.price}`, 
					amount: scheduleTime.price, 
					transactionType: 'credit',
					balanceAfterTransaction: mentee.wallet, 
				};
				mentee.walletHistory.push(transaction);
				await mentee.save({ session });
			}
			bookedSlot.status = timeSheduleStatus.CANCELLED;
			await bookedSlot.save({ session });
			scheduleTime.isBooked = false;
			await scheduleTime.save({ session });
	
			await session.commitTransaction();
		} catch (error) {
			await session.abortTransaction();
			throw new Error(`Cancellation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
		} finally {
			session.endSession();
		}
	}
	
	  
	async allowConnection(bookedId:string): Promise<void> {
		try {
			await BookedSlots.findByIdAndUpdate(
				bookedId,                
				{ isAllowed: true },      
				{ new: true }              
			  );
			  return 
		} catch (error) {
		  if (error instanceof Error) {
			console.log(error.message);
		  }
		  throw new Error('An unexpected error occurred.');
		}
	  }

	  async endConnection(bookedId:string): Promise<void> {
		try {
			await BookedSlots.findByIdAndUpdate(
				bookedId,                
				{ isAllowed: false,isAttended : true,status : timeSheduleStatus.COMPLETED  },
				{ new: true }              
			  );
			  return 
		} catch (error) {
		  if (error instanceof Error) {
			console.log(error.message);
		  }
		  throw new Error('An unexpected error occurred.');
		}
	  }

	  async getAllQuestions(mentorId: string, page: number, limit: number, status: string): Promise<{ questions: IQa[], total: number }> {
		try {
			const query: any = {};
			let total = 0; 
			if (status === "unanswered") {
				query.isAnswered = false;
				total = await QA.countDocuments({ isAnswered: false }) || 0; 
			} else if (status === "myAnswers") {
				query.mentorId = mentorId;
				total = await QA.countDocuments({ mentorId: mentorId }) || 0; 
			}
	
			const allQuestions = await QA.find(query)
				.sort({ isAnswered: 1, createdAt: -1 })  
				.skip((page - 1) * limit)
				.limit(limit);
	
			return { questions: allQuestions, total };
		} catch (error) {
			if (error instanceof Error) {
				console.log(error.message);
			}
			throw new Error('An unexpected error occurred.');
		}
	}
	
	
	async findQaById(id:string): Promise<IQa | null> {
		try {
			const qa = await QA.findById(id)
			return qa
		} catch (error) {
		  if (error instanceof Error) {
			console.log(error.message);
		  }
		  throw new Error('An unexpected error occurred.');
		}
	  }

	  async submitQAAnswer(submitAnswer:IQa,mentorId:string,answer:string): Promise<void> {
		try {
			submitAnswer.reply = answer
			submitAnswer.isAnswered = true
			submitAnswer.mentorId = mentorId as unknown as Types.ObjectId
			await submitAnswer.save()
			return
		} catch (error) {
		  if (error instanceof Error) {
			console.log(error.message);
		  }
		  throw new Error('An unexpected error occurred.');
		}
	  }
	
	  async editQAAnswer(questionId:string,mentorId:string,answer:string): Promise<void> {
		try {
			const submitAnswer = await QA.findByIdAndUpdate(questionId)
			if(!submitAnswer){
				throw new Error("no question found")
			}
			const mentorID = mentorId as unknown as Types.ObjectId
			submitAnswer.reply = answer
			await submitAnswer.save()
			return
		} catch (error) {
		  if (error instanceof Error) {
			console.log(error.message);
		  }
		  throw new Error('An unexpected error occurred.');
		}
	  }

	  async createComminityMeet(formData:ICOmmunityFormData,mentorId:string,RoomId:string,imageUrl:string): Promise<void> {
		try {
			const communityMeet = new CommunityMeet({
				date:formData.date,
				startTime:formData.startTime,
				endTime:formData.endTime,
				mentorId:mentorId,
				about: formData.about,
				RoomId,
				image: imageUrl,
				stack:formData.stack

			})
			await communityMeet.save()
			return
		} catch (error) {
		  if (error instanceof Error) {
			console.log(error.message);
		  }
		  throw new Error('An unexpected error occurred.');
		}
	  }

	 
	  
	  async getAllCommunityMeet(): Promise<EnhancedCommunityMeet[]> {
		try {
		  const today = new Date();
		  today.setHours(0, 0, 0, 0);
	  
		  const meetData = await CommunityMeet.find({
			date: { $gte: today }, 
		  })
			.sort({ createdAt: -1 }) 
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
	  
		  return enhancedMeetData;
		} catch (error) {
		  if (error instanceof Error) {
			console.log(error.message);
		  }
		  throw new Error(
			'An unexpected error occurred while fetching community meet data.'
		  );
		}
	  }
	  
	  async getMyCommunityMeet(mentorId: string): Promise<EnhancedCommunityMeet[]> {
		try {
		  const today = new Date();
		  today.setHours(0, 0, 0, 0);
	  
		  const meetData = await CommunityMeet.find({
			mentorId,
			date: { $gte: today } 
		  })
			.sort({ date: 1, startTime: 1 }) 
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
	  
		  return enhancedMeetData;
		} catch (error) {
		  if (error instanceof Error) {
			console.log(error.message);
		  }
		  throw new Error(
			'An unexpected error occurred while fetching community meet data.'
		  );
		}
	  }

	  async cancelCommunityMeet(meetId:string,about:string): Promise<boolean> {
		try {
			const cancelMeet = await CommunityMeet.findByIdAndUpdate(meetId,{about:about},{ new: true })
			if(cancelMeet){
				return true
			}else{
				throw new Error("meetId not found")
			}
		} catch (error) {
		  if (error instanceof Error) {
			console.log(error.message);
		  }
		  throw new Error('An unexpected error occurred.');
		}
	  }

		async getMentorRating(mentorId: string, page: number, limit: number, skip: number): Promise<{
		  ratings: IRating[];
		  totalCount: number;
		  ratingCounts: RatingCounts;
		}> {
		  try {
			const mentor = await MentorVerifyModel.findOne({ mentorId });
			if (!mentor) {
			  throw new Error("Mentor is not valid");
			}
			const mentorverifyId = mentor._id;
	  
			const ratings = await Rating.find({ mentor: mentorverifyId })
			  .populate('mentee', 'name')
			  .skip(skip)
			  .limit(limit)
			  .exec();
	  
			const totalCount = await Rating.countDocuments({ mentor: mentorverifyId });
	  
			const ratingCounts = await Rating.aggregate([
			  { $match: { mentor: mentorverifyId } },
			  {
				$group: {
				  _id: '$ratingValue',
				  count: { $sum: 1 }
				}
			  }
			]);
	  
			const formattedRatingCounts: RatingCounts = {
			  1: 0,
			  2: 0,
			  3: 0,
			  4: 0,
			  5: 0
			};
	  
			ratingCounts.forEach(({ _id, count }) => {
			  if (_id >= 1 && _id <= 5) {
				formattedRatingCounts[_id as keyof RatingCounts] = count;
			  }
			});
	  
			return {
			  ratings,
			  totalCount,
			  ratingCounts: formattedRatingCounts
			};
		  } catch (error) {
			if (error instanceof Error) {
			  console.log(error.message);
			}
			throw new Error('An unexpected error occurred.');
		  }
		}
	  
	  
	
	  async getNotifications(mentorId: string): Promise<INotification[]> {
		try {
			const mentorData = await MentorVerifyModel.findOne({mentorId:mentorId})
			if(!mentorData){
				throw new Error("mentor not found")
			}
			const notifications = await NotificationModel.find({ reciver: mentorData._id, read: false })
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
	  
	   
	async markReadChat(mentorId: string,chatId:string): Promise<void> {
		try {
			const mentorData = await MentorVerifyModel.findOne({mentorId:mentorId})
			if(!mentorData){
				throw new Error("mentor not found")
			}
			await NotificationModel.updateMany(
				{
				  chat: chatId,
				  reciver: mentorData._id,
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
export default MentorRepository;
