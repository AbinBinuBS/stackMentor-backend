import mongoose,{ObjectId} from "mongoose";

export interface TokenResponce{
    accessToken:string;
    refreshToken:string;
}

export interface TokenwithCridential {
  emailExists:boolean;
  accessToken?:string;
  refreshToken?:string;
  message:string
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

  export default interface ICheckIsBooked {
    sessionId:string;
    amount:Number;
  }



  export interface MentorData {
    _id:string;
    name: string;
    image: string;
  }
  
  export interface BookedSlot {
    _id: mongoose.Types.ObjectId;
    date: Date;
    startTime: string;
    endTime: string;
    price: number;
    mentorData: MentorData;
  }


  export interface menteeChatData {
    id: string;
    name: string;
    phone: string;
    email: string;
    isActive: true,
    isAdmin: false,
  }


  interface IMentor {
    _id: mongoose.Types.ObjectId;
    mentorId: mongoose.Types.ObjectId;
    name: string;
    dateOfBirth: Date;
    image: string;
    about: string;
    degree: string;
    college: string;
    yearOfGraduation: string;
    jobTitle: string;
    lastWorkedCompany: string;
    yearsOfExperience: string;
    stack: string;
    resume: string;
    degreeCertificate: string;
    experienceCertificate: string;
    isVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
  }
  
  interface IMentee {
    _id: mongoose.Types.ObjectId;
    name: string;
    email: string;
    phone: string;
    isActive: boolean;
    isAdmin: boolean;
    createdAt: Date;
    updatedAt: Date;
    __v: number;
  }
  
  export interface IExistingMessage {
    _id: mongoose.Types.ObjectId;
    chatName: string;
    mentor: IMentor;
    mentee: IMentee;
    createdAt: Date;
    updatedAt: Date;
    __v: number;
    latestMessage: {
      _id: mongoose.Types.ObjectId;
      sender: mongoose.Types.ObjectId;
      senderModel: string;
      content: string;
      chat: mongoose.Types.ObjectId;
      readBy: mongoose.Types.ObjectId[];
      createdAt: Date;
      updatedAt: Date;
      __v: number;
    };
  }
  