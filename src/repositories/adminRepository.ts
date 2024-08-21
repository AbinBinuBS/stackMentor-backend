import { IAdminMentorList } from "../interfaces/servicesInterfaces/IAdmin";
import Mentee, { IMentee } from "../models/menteeModel";
import Mentor, { IMentor } from "../models/mentorModel";
import MentorVerifyModel, { IMentorVerify } from "../models/mentorValidate";

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

	async getMentor(status: string): Promise<Array<IAdminMentorList>> {
		try {
			const matchCriteria: any = {
				isVerified: status,
			};
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
			]);
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
				console.error("Mentor not found.");
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

	async getMentorDetails(id: string): Promise<IMentorVerify> {
		try {
			const mentorData = await MentorVerifyModel.findOne({ mentorId: id });
			if (!mentorData) {
				throw new Error("something happend, please try again.");
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

	async getUsers(): Promise<Array<IAdminMentorList>> {
		try {
		  const userData = await Mentee.aggregate([
			{
			  $match: { isAdmin: false }
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
				console.error("User not found.");
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
}

export default AdminRepository;
