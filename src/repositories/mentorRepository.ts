import { MentorVerifyData } from "../interfaces/servicesInterfaces/IMentor";
import Mentor, { IMentor } from "../models/mentorModel";
import MentorVerifyModel from "../models/mentorValidate";
import MentorTempModel, { IMentorSchema } from "../models/tempregisterMentor";
import HashedPassword from "../utils/hashedPassword";
import { generateOTP, sendVerifyMail } from "../utils/mail";

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
				isVerified:"biginner"
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

	async isVerifiedMentor(id:string):Promise<string | undefined>{
		try{
			const mentorData = await Mentor.findById({_id:id})
			console.log(mentorData)
			return mentorData?.isVerified
		}catch(error){
			if (error instanceof Error) {
				console.error(error.message);
			} else {
				console.log("An unknown error has occurred");
			}
			throw error;
		}
	}

	async verifyMentor(mentorData:MentorVerifyData,id:string): Promise<boolean | undefined>{
		try{
			let userData = await Mentor.findById(id);
			if (!mentorData || !id) {
			throw new Error("Not able to verify your account now, please try again after sometime.");
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
			if(verifyMentorData){
				return true
			}else{
				return false
			}
		}catch(error){
			if(error instanceof Error){
				console.log(error.message)
			}
		}
	}

	async findMentorBtId(id:string):Promise<IMentor | undefined>{
		try{
			const mentorData = await Mentor.findById({_id:id})
			if(!mentorData){
				throw new Error("Mentor do not exist")
			}
			return mentorData
		}catch(error){
			if(error instanceof Error){
				console.log(error.message)
			}
		}
	}
}
export default MentorRepository;
