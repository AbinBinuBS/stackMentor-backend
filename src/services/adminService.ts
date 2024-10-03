import {
	IAdminLogin,
	IAdminMentorList,
	IAdminUserList,
	IDashboardData,
	TokenResponce,
} from "../interfaces/servicesInterfaces/IAdmin";
import { EnhancedCommunityMeet } from "../interfaces/servicesInterfaces/IMentor";
import { IMentorVerify } from "../models/mentorValidate";
import { IQa } from "../models/qaModel";
import AdminRepository from "../repositories/adminRepository";
import HashedPassword from "../utils/hashedPassword";
import { generateAccessToken, generateRefreshToken } from "../utils/jwtToken";

class AdminService {
	constructor(private adminRepository: AdminRepository) {}
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

	async getMentor(status: string): Promise<Array<IAdminMentorList>> {
		try {
			const mentorData = await this.adminRepository.getMentor(status);
			if (!mentorData) {
				throw new Error("No mentors are joined yet.");
			}
			return mentorData;
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

	async getMentorDetails(id:string): Promise<IMentorVerify>{
		try{
			const mentorData = await this.adminRepository.getMentorDetails(id)
			return mentorData
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

	async getUsers(): Promise<Array<IAdminUserList>> {
		try {
			const userData = await this.adminRepository.getUsers();
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
			const graphData = await this.adminRepository.getGraphData();
			console.log("111111111111111111111111111111111111111",graphData)
			return graphData;
		} catch (error) {
		  if (error instanceof Error) {
			console.error(error.message);
		  } else {
			console.error("An unknown error occurred");
		  }
		  throw error;
		}
	  }

	  async getAllQuestions(): Promise<IQa[]> {
		try {
			const AllQuestions = await this.adminRepository.getAllQuestions();
			return AllQuestions
		} catch (error) {
			if (error instanceof Error) {
				console.error(error.message);
			}
			throw new Error("An unexpected error occurred.");
		}
	}
	  
	async editQAAnswer(questionId:string,answer:string): Promise<void> {
		try {
			const editAnswer = await this.adminRepository.editQAAnswer(questionId,answer);
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
			const editAnswer = await this.adminRepository.removeQuestion(questionId);
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
