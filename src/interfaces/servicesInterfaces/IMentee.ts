import mongoose,{ObjectId} from "mongoose";

export interface TokenResponce{
    accessToken:string;
    refreshToken:string;
}

export interface IMenteeLogin {
    email:string;
    password:string
}

export interface IOtpVerify {
    email:string;
    otp:string
}


export interface IMentorShowcase {
    _id: string;
    name:string;
	mentorId: string;
	image: string;
	about: string;
	yearsOfExperience: number;
}


export interface ISlot {
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
  
  export interface IMentorVerification {
    name: string;
    image: string;
    yearsOfExperience: string | number;
  }
  
  export interface ICombinedData {
    slots: ISlot[];
    mentorVerification: IMentorVerification;
  }