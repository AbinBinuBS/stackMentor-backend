import {
	IAdminLogin,
	IAdminMentorList,
	IAdminUserList,
	TokenResponce,
} from "../interfaces/servicesInterfaces/IAdmin";
import { IMentorVerify } from "../models/mentorValidate";
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
}

export default AdminService;
