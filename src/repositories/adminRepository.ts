import { IAdminMentorList, IDashboardData, IMentorConbineData } from "../interfaces/servicesInterfaces/IAdmin";
import Mentee, { IMentee } from "../models/menteeModel";
import Mentor, { IMentor } from "../models/mentorModel";
import ScheduleTime from "../models/mentorTimeSchedule";
import MentorVerifyModel, { IMentorVerify } from "../models/mentorValidate";
import QA, { IQa } from "../models/qaModel";
import { EnhancedCommunityMeet } from "../interfaces/servicesInterfaces/IMentor";
import CommunityMeet from "../models/communityMeetModel";

class AdminRepository {
	async findAdminByEmail(email: string): Promise<IMentee | null> {
		try {
			const menteeData = await Mentee.findOne({ email }).exec();
			return menteeData;
		} catch (error: any) {
			console.error(`Error in findMenteeByEmail: ${error.message}`);
			throw new Error(`Unable to find mentee: ${error.message}`);
		}
	}

	async getMentor(status: string, page: number, limit: number, searchQuery: string): Promise<{ mentorData: Array<IAdminMentorList>, totalCount: number }> {
		try {
			console.log(searchQuery)
			const matchCriteria: any = {
				...(status ? { isVerified: status } : {}),
				...(searchQuery ? { $or: [{ name: { $regex: searchQuery, $options: "i" } }, { email: { $regex: searchQuery, $options: "i" } }] } : {})
			};
	
			const totalCount = await Mentor.countDocuments(matchCriteria);
			const mentorData = await Mentor.aggregate([
				{ $match: matchCriteria },
				{ $sort: { createdAt: -1 } },
				{
					$project: {
						_id: 1,
						name: 1,
						email: 1,
						isActive: 1,
						isVerified: 1,
					},
				},
				{ $skip: (page - 1) * limit },
				{ $limit: limit },
			]);
	
			return { mentorData, totalCount };
		} catch (error) {
			if (error instanceof Error) {
				console.error(error.message);
			} else {
				console.error("An unknown error occurred");
			}
			throw error;
		}
	}
	
	
	


	async blockMentor(id: string, active: boolean): Promise<boolean> {
		try {
			const newStatus = !active;
			const result = await Mentor.findByIdAndUpdate(
				id,
				{ $set: { isActive: newStatus } },
				{ new: true }
			);
			if (result) {
				return newStatus;
			} else {
				throw new Error("something unexpected happened please try again.");
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

	async getMentorDetails(id: string): Promise<IMentorConbineData> {
		try {
			const mentor = await Mentor.findById(id)
			const mentorData = await MentorVerifyModel.findOne({ mentorId: id });
			if (!mentorData) {
				throw new Error("something happend, please try again.");
			}
			if(!mentor){
				throw new Error("something happend, please try again.");
			}
			return {mentorData,mentor}
		} catch (error) {
			if (error instanceof Error) {
				console.error(error.message);
			} else {
				console.error("An unknown error occurred");
			}
			throw error;
		}
	}

	async updateMentorStatus(id: string, status: string): Promise<boolean> {
		try {
			const mentorStatus = await Mentor.findByIdAndUpdate(
				id,
				{ $set: { isVerified: status } },
				{ new: true }
			);
			if (!mentorStatus) {
				throw new Error("Mentor not found or update failed, please try again.");
			}
			if (status === "verified") {
				const verifyMentorUpdate = await MentorVerifyModel.findOneAndUpdate(
					{ mentorId: id },
					{ $set: { isVerified: true } },
					{ new: true }
				);
				if (!verifyMentorUpdate) {
					throw new Error(
						"Verification document update failed, please try again."
					);
				}
			}
			return true;
		} catch (error) {
			if (error instanceof Error) {
				console.error(`Error updating mentor status: ${error.message}`);
			} else {
				console.error("An unknown error occurred");
			}
			return false;
		}
	}

	async getUsers(skip: number, limit: number, searchTerm: string): Promise<Array<IAdminMentorList>> {
		try {
			const userData = await Mentee.aggregate([
				{
					$match: { 
						isAdmin: false,
						$or: [ 
							{ name: { $regex: searchTerm, $options: 'i' } },
							{ email: { $regex: searchTerm, $options: 'i' } }
						]
					}
				},
				{ 
					$sort: { createdAt: -1 } 
				},
				{
					$project: {
						_id: 1,
						name: 1,
						email: 1,
						isActive: 1,
						isVerified: 1,
					},
				},
				{ $skip: skip }, 
				{ $limit: limit } 
			]);
			return userData;
		} catch (error) {
			if (error instanceof Error) {
				console.error(error.message);
			} else {
				console.error("An unknown error occurred");
			}
			throw error;
		}
	}
		  

	async getTotalUsersCount(searchTerm: string): Promise<number> {
		try {
			const totalCount = await Mentee.countDocuments({
				isAdmin: false,
				$or: [
					{ name: { $regex: searchTerm, $options: 'i' } },
					{ email: { $regex: searchTerm, $options: 'i' } }
				]
			});
			return totalCount;
		} catch (error) {
			if (error instanceof Error) {
				console.error(error.message);
			} else {
				console.error("An unknown error occurred");
			}
			throw error;
		}
	}
	

	async blockUser(id: string, active: boolean): Promise<boolean> {
		try {
			const newStatus = !active;
			const result = await Mentee.findByIdAndUpdate(
				id,
				{ $set: { isActive: newStatus } },
				{ new: true }
			);
			if (result) {
				return newStatus;
			} else {
				throw new Error("something unexpected happened please try again.");
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

	async getGraphData(): Promise<IDashboardData> {
		const currentYear = new Date().getFullYear();
		const revenueData = await ScheduleTime.aggregate([
			{
				$match: {
					date: {
						$gte: new Date(`${currentYear}-01-01`),
						$lt: new Date(`${currentYear + 1}-01-01`)
					},
					isBooked: true,
				}
			},
			{
				$group: {
					_id: { $month: "$date" },
					total: { $sum: { $multiply: ["$price", 0.3] } }  
				}
			},
			{
				$sort: { "_id": 1 } 
			}
		]);
	
		const monthlyRevenue = new Array(12).fill(0);
	
		revenueData.forEach((data) => {
			monthlyRevenue[data._id - 1] = data.total; 
		});
	
		const mentorCount = await Mentor.countDocuments();
	
		const menteeCount = await Mentee.countDocuments();
	
		return {
			monthlyRevenue,
			mentorCount,
			menteeCount,
		};
	}

	async findAdminById(id: string): Promise<IMentee | undefined> {
		try {
			const adminData = await Mentee.findById({ _id: id });
			if (!adminData) {
				throw new Error("admin do not exist");
			}
			return adminData;
		} catch (error) {
			if (error instanceof Error) {
				console.log(error.message);
			}
			throw new Error("An unexpected error occurred.");
		}
	}

	async getAllQuestions(page: number, limit: number, status: string): Promise<IQa[]> {
		try {
			const skip = (page - 1) * limit; 
	
			const queryCondition: Record<string, any> = {};
	
			if (status === "answered") {
				queryCondition.isAnswered = true;
			} else if (status === "unanswered") {
				queryCondition.isAnswered = false;
			}
	
			const allQuestions = await QA.find(queryCondition)
				.sort({ createdAt: -1 }) 
				.skip(skip) 
				.limit(limit);
	
			return allQuestions;
		} catch (error) {
			if (error instanceof Error) {
				console.log(error.message);
			}
			throw new Error('An unexpected error occurred.');
		}
	}
	
	
	async countQuestions(status: string): Promise<number> {
		try {
			const queryCondition: Record<string, any> = {};
	
			if (status === "answered") {
				queryCondition.isAnswered = true;
			} else if (status === "unanswered") {
				queryCondition.isAnswered = false;
			}
	
			return await QA.countDocuments(queryCondition);
		} catch (error) {
			if (error instanceof Error) {
				console.log(error.message);
			}
			throw new Error('An unexpected error occurred while counting questions.');
		}
	}
	
	

	  async editQAAnswer(questionId:string,answer:string): Promise<void> {
		try {

			const submitAnswer = await QA.findByIdAndUpdate(questionId)
			if(!submitAnswer){
				throw new Error("no question found")
			}
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

	  async removeQuestion(questionId:string): Promise<void> {
		try {
			const submitAnswer = await QA.findByIdAndDelete(questionId)
			if(submitAnswer){
				return
			}else{
				throw new Error("Canot find the Question.")
			}
		} catch (error) {
		  if (error instanceof Error) {
			console.log(error.message);
		  }
		  throw new Error('An unexpected error occurred.');
		}
	  }

	  async getMeets(): Promise<EnhancedCommunityMeet[]> {
		try {
		  const meetData = await CommunityMeet.find()
			.sort({ date: 1, startTime: 1 }) 
			.lean()
			.exec();
	  
		  const enhancedMeetData = await Promise.all(
			meetData.map(async (meet): Promise<EnhancedCommunityMeet> => {
			  const mentorVerifyData = await MentorVerifyModel.findOne(
				{ mentorId: meet.mentorId },
				'name image'
			  ).lean().exec();
	  
			  return {
				...meet,
				mentorInfo: mentorVerifyData 
				  ? {
					  name: mentorVerifyData.name,
					  image: mentorVerifyData.image
					}
				  : undefined
			  };
			})
		  );
		  
		  return enhancedMeetData;
		} catch (error) {
		  if (error instanceof Error) {
			console.log(error.message);
		  }
		  throw new Error('An unexpected error occurred while fetching community meet data.');
		}
	  }


	  
}

export default AdminRepository;
