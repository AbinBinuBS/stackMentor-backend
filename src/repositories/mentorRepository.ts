import e from "express";
import {
	EnhancedCommunityMeet,
	ICOmmunityFormData,
	ISlotMentor,
	ISlotsList,
	MentorVerification,
	MentorVerifyData,
} from "../interfaces/servicesInterfaces/IMentor";
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
import { ITransaction } from "../interfaces/servicesInterfaces/IMentee";
import Rating, { IRating } from "../models/ratingModel";
import NotificationModel, { INotification } from "../models/notificationModel";




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
					$lookup: {
						from: 'bookedslots', 
						localField: '_id',   
						foreignField: 'slotId', 
						as: 'bookedSlots',  
					},
				},
				{
					$project: {
						_id: 1,
						date: 1,
						startTime: 1,
						endTime: 1,
						bookedSlots: {
							isAllowed: 1,
							isAttended: 1,
							isExpired: 1,
							status: 1,
							userId: 1,
							roomId: 1,
						},
					},
				},
			]);
	
			return scheduledDatas;
		} catch (error) {
			if (error instanceof Error) {
				console.log(error.message);
			}
			throw new Error("An unexpected error occurred.");
		}
	}
	

	async deleteScheduledSlot(id: string): Promise<boolean> {
		if (!Types.ObjectId.isValid(id)) {
			return false;
		}

		try {
			const slotData = await ScheduleTime.findById(id);
			if(slotData?.isBooked == true){
				throw new Error("This slots already booked.")
			}
			if (!slotData) {
				return false;
			}
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

	
	async getBookedSlots(id: string): Promise<ISlotMentor[]> {
		try {
			const objectId = new mongoose.Types.ObjectId(id);
			const today = new Date();
			today.setHours(0, 0, 0, 0); 
	
			const bookedSlots: ISlotMentor[] = await ScheduleTime.aggregate([
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
					$sort: {
						date: 1, 
						startTime: 1, 
					},
				},
			]);
			
	
			return bookedSlots;
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
		  if (!Types.ObjectId.isValid(mentorId)) {
			throw new Error("Invalid mentorId provided.");
		  }
	  
		  const updatedMentor = await Mentor.findByIdAndUpdate(
			mentorId,
			{ name },
			{ new: true } 
		  );
	  
		  if (!updatedMentor) {
			throw new Error("Mentor not found.");
		  }
	  
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
		  const hashedPassword = await HashedPassword.hashPassword(newPassword);
	  
		  const updatePassword = await Mentor.findByIdAndUpdate(
			mentorId, 
			{ password: hashedPassword }, 
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
			const setConnection = await BookedSlots.findByIdAndUpdate(
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
			const setConnection = await BookedSlots.findByIdAndUpdate(
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

	  async getAllQuestions(mentorId:string): Promise<IQa[]> {
		try {
			const allQuestions = await QA.find({
				$or: [
				  { isAnswered: false },
				  { mentorId: mentorId }
				]
			  })
			  .sort({ isAnswered: 1, createdAt: -1 }); 
		  
			 return allQuestions
		} catch (error) {
		  if (error instanceof Error) {
			console.log(error.message);
		  }
		  throw new Error('An unexpected error occurred.');
		}
	  }

	  async submitQAAnswer(questionId:string,mentorId:string,answer:string): Promise<void> {
		try {

			const submitAnswer = await QA.findById(questionId)
			if(!submitAnswer){
				throw new Error("no question found")
			}
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

	  async createComminityMeet(formData:ICOmmunityFormData,mentorId:string,imageUrl:string): Promise<void> {
		try {
			const RoomId = await CommunityRoomId()
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

	  async getMentorRating(mentorId:string): Promise<IRating[] | null> {
		try {
			const mentor = await MentorVerifyModel.findOne({mentorId:mentorId})
			if(!mentor){
				throw new Error("mentor is not valid")
			}
			const mentorverifyId = mentor?._id
			const reviewData = await Rating.find({ mentor: mentorverifyId })
			  .populate('mentee', 'name')
			  .exec();
			  return reviewData
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
