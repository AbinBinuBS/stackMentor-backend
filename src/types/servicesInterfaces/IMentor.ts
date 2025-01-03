import { ObjectId, Types } from "mongoose";
import { ICommunityMeet } from "../../models/communityMeetModel";
import { IMentor } from "../../models/mentorModel";
import { IRating } from "../../models/ratingModel";
import { IChat } from "../../models/chatModel";

export interface IMentorLogin {
	email: string;
	password: string;
}

export interface MentorVerifyData {
	name: string;
	dateOfBirth: Date;
	about: string;
	degree: string;
	college: string;
	yearOfGraduation: string;
	jobTitle: string;
	lastWorkedCompany: string;
	yearsOfExperience: string;
	stack: string;
	fileUrls: {
		resume: string;
		degreeCertificate: string;
		experienceCertificate: string;
		image: string;
	};
}

export interface MentorVerifyFiles {
	resume?: Express.Multer.File;
	degreeCertificate?: Express.Multer.File;
	experienceCertificate?: Express.Multer.File;
	image?: Express.Multer.File;
}

export interface ISlotsList {
	date: Date;
	startTime: String;
	endTime: String;
	id: string;
}

export interface ISlotMentor {
	_id: ObjectId;
	date: Date;
	startTime: string;
	endTime: string;
	price: number;
	mentorId: ObjectId;
	isBooked: boolean;
	createdAt: Date;
	updatedAt: Date;
}

export interface MentorId {
	_id: ObjectId;
	name: string;
	email: string;
	password: string;
	isActive: boolean;
	isVerified: string;
	createdAt: Date;
	updatedAt: Date;
	__v: number;
}

export interface MentorVerification {
	_id: ObjectId;
	mentorId: MentorId;
	name: string;
	dateOfBirth: Date;
	image: string;
	about: string;
	degree: string;
	college: string;
	yearOfGraduation: string;
	jobTitle: string;
	lastWorkedCompany: string;
	yearsOfExperience: number;
	stack: string;
	resume: string;
	degreeCertificate: string;
	experienceCertificate: string;
	isVerified: boolean;
	createdAt: Date;
	updatedAt: Date;
	__v: number;
}

export interface ICOmmunityFormData {
	date: Date;
	startTime: string;
	endTime: string;
	about: string;
	mentorId?: Types.ObjectId;
	RoomId?: string;
	image: string;
	stack: string;
}

export interface EnhancedCommunityMeet
	extends Omit<ICommunityMeet, "mentorId"> {
	mentorId: IMentor["_id"];
	mentorInfo?: {
		name: string;
		image: string;
	};
}

export interface EnhancedCommunityMeetCombined {
	meets: EnhancedCommunityMeet[];
	totalCount:number;
}


export type WeekDay = 'MO' | 'TU' | 'WE' | 'TH' | 'FR' | 'SA' | 'SU';


export interface RatingCounts {
	1: number;
	2: number;
	3: number;
	4: number;
	5: number;
  }
  
  export interface RatingResponse {
	ratings: IRating[];
	totalCount: number;
	ratingCounts: RatingCounts;
	totalPages: number;
  }


  export interface IMessageCombined {
	_id: ObjectId;
	sender: {
	  _id: ObjectId;
	  name: string;
	  email: string;
	};
	senderModel: string;
	receiver: ObjectId;
	receiverModel: string;
	content: string;
	chat: IChat
	readBy: Array<ObjectId>;
	createdAt: Date;
	updatedAt: Date;
	__v: number;
  }