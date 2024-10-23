import { ObjectId } from "mongoose";
import { IQa } from "../models/qaModel";
import HashedPassword from "../utils/hashedPassword";
import { generateAccessToken, generateRefreshToken } from "../utils/jwtToken";
import jwt, { JwtPayload } from "jsonwebtoken";
import { IAdminLogin, IAdminMentorList, IAdminUserList, IDashboardData, IMentorConbineData, TokenResponce } from "../types/servicesInterfaces/IAdmin";
import { adminPayload } from "../types/commonInterfaces/tokenInterfaces";
import { EnhancedCommunityMeet } from "../types/servicesInterfaces/IMentor";
import { IAdminService } from "../interfaces/admin/IAdminService";
import { IAdminRepository } from "../interfaces/admin/IAdminRepository";


class AdminService implements IAdminService {
	constructor(private adminRepository: IAdminRepository) {}
	async adminLogin(
		adminData: Partial<IAdminLogin>
	): Promise<TokenResponce | null | undefined> {
		if (!adminData.email || !adminData.password) {
			throw new Error("Email and password are required");
		}
		try {
			const adminRespose = await this.adminRepository.findAdminByEmail(
				adminData.email
			);
			if (!adminRespose) {
				throw new Error("Admin does not exist");
			}
			if (!adminRespose.isAdmin) {
				throw new Error("Admin does not exist.");
			}
			if (adminRespose.password) {
				const isPasswordValid = await HashedPassword.comparePassword(
					adminData.password,
					adminRespose.password
				);
				if (isPasswordValid) {
					const userPayload = {
						id: adminRespose.id,
						name: adminRespose.name,
						phone: adminRespose.phone,
						email: adminRespose.email,
						isActive: adminRespose.isActive,
						isAdmin: adminRespose.isAdmin,
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

	async getMentor(status: string, page: number, limit: number, searchQuery: string): Promise<{ mentorData: Array<IAdminMentorList>, totalPages: number }> {
		try {
			const mentorData= await this.adminRepository.getMentor(status, page, limit, searchQuery);
			if (!mentorData) {
				throw new Error("No mentors are joined yet.");
			}
			const totalCount = await this.adminRepository.getMentorCount(status,searchQuery)
			const totalPages = Math.ceil(totalCount / limit) | 0
			return { mentorData, totalPages };
		} catch (error) {
			if (error instanceof Error) {
				console.error(error.message);
			} else {
				console.error("An unknown error occurred");
			}
			throw error;
		}
	}
	

	async blockMentor(id: string,active:boolean): Promise<boolean> {
		try {
			const blockedMentor = await this.adminRepository.blockMentor(id,active)
			return blockedMentor
		} catch (error) {
			if (error instanceof Error) {
				console.error(error.message);
			} else {
				console.error("An unknown error occurred");
			}
			throw error;
		}
	}

	async getMentorDetails(id:string): Promise< IMentorConbineData>{
		try{
			const mentor = await this.adminRepository.findMentorById(id)
			const mentorData = await this.adminRepository.findMentorVerifyById(id)
			return {mentorData,mentor}
		}catch(error){
			if (error instanceof Error) {
				console.error(error.message);
			} else {
				console.error("An unknown error occurred");
			}
			throw error;
		}
	}

	async updateMentorStatus(id:string,status:string): Promise<boolean>{
		try{
			const mentorData = await this.adminRepository.findMentorByIdAndUpdate(id, status)
			const mentorStatus = await this.adminRepository.updateMentorStatus(id,status)
			if(mentorStatus){
				return true
			}
			return false
		}catch(error){
			if (error instanceof Error) {
				console.error(error.message);
			} else {
				console.error("An unknown error occurred");
			}
			throw error;
		}
	}

	async getUsers(skip: number, limit: number,searchTerm:string): Promise<Array<IAdminUserList>> {
		try {
			const userData = await this.adminRepository.getUsers(skip, limit,searchTerm);
			if (!userData) {
				throw new Error("No users are joined yet.");
			}
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
	async getTotalUsersCount(searchTerm:string): Promise<number> {
		try {
			const totalCount = await this.adminRepository.getTotalUsersCount(searchTerm);
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

	async blockUser(id: string,active:boolean): Promise<boolean> {
		try {
			const blockedUser = await this.adminRepository.blockUser(id,active)
			return blockedUser
		} catch (error) {
			if (error instanceof Error) {
				console.error(error.message);
			} else {
				console.error("An unknown error occurred");
			}
			throw error;
		}
	}

	async getgraphData(): Promise<IDashboardData> {
		try {
			const mentorCount = await this.adminRepository.totalMentorCount()
			const menteeCount = await this.adminRepository.totalMenteeCount()
			const monthlyRevenue = await this.adminRepository.getGraphData();
			return {
				monthlyRevenue,
				menteeCount,
				mentorCount
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

	  async createNewRefreshToken(
		refreshTokenData: string
	): Promise<TokenResponce> {
		try {
			const decoded = jwt.verify(
				refreshTokenData,
				process.env.REFRESH_TOKEN_PRIVATE_KEY as string
			) as JwtPayload;
			const { id } = decoded;
			const isAdmin = await this.adminRepository.findAdminById(id);
			if (!isAdmin) {
				throw new Error("Admin not found");
			}
			const userPayload: adminPayload = {
				id: isAdmin._id as ObjectId,
				name: isAdmin.name,
				email: isAdmin.email,
				isActive: isAdmin.isActive,
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

	async getAllQuestions(page: number, limit: number, status:string): Promise<{ questions: IQa[], totalCount: number }> {
		try {
			const queryCondition: Record<string, boolean | string | number | object | undefined> = {};
			const skip = (page - 1) * limit;
			if (status === "answered") {
				queryCondition.isAnswered = true;
			} else if (status === "unanswered") {
				queryCondition.isAnswered = false;
			}
			const totalCount = await this.adminRepository.countQuestions(queryCondition); 
			const questions = await this.adminRepository.getAllQuestions(skip, limit,queryCondition); 
			return { questions, totalCount };
		} catch (error) {
			if (error instanceof Error) {
				console.error(error.message);
			}
			throw new Error("An unexpected error occurred.");
		}
	}
	
	  
	async editQAAnswer(questionId:string,answer:string): Promise<void> {
		try {
			await this.adminRepository.editQAAnswer(questionId,answer);
			return 
		} catch (error) {
			if (error instanceof Error) {
				console.error(error.message);
			}
			throw new Error("An unexpected error occurred.");
		}
	}

	async removeQuestion(questionId:string): Promise<void> {
		try {
			await this.adminRepository.removeQuestion(questionId);
			return 
		} catch (error) {
			if (error instanceof Error) {
				console.error(error.message);
			}
			throw new Error("An unexpected error occurred.");
		}
	}

	async getMeets(): Promise<EnhancedCommunityMeet[]> {
		try {
			const meetData = await this.adminRepository.getMeets();
			return meetData
		} catch (error) {
			if (error instanceof Error) {
				console.error(error.message);
			}
			throw new Error("An unexpected error occurred.");
		}
	}

	
}

export default AdminService;
