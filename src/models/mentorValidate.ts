
import mongoose ,{Document,ObjectId,Schema} from "mongoose"

export interface IMentorVerify extends Document {
    mentorId:ObjectId;
    name: string;
    dateOfBirth: Date;
    about: string;
    image: string;
    degree:string;
    college:string;
    yearOfGraduation:number;
    jobTitle:string;
    lastWorkedCompany:string;
    yearsOfExperience:Number;
    stack:string;
    resume:string;
    degreeCertificate:string;
    experienceCertificate:string;
    isVerified:boolean;
}


const mentorValidateSchema :Schema = new Schema(
    {
        mentorId :{
            type: Schema.Types.ObjectId,
            ref: 'Mentor',
            required: true
        },
        name: {
            type:String,
            required:true,
        },
        dateOfBirth: {
            type:Date,
            required:true,
        },
        image :{
            type:String,
            required:true,
        },
        about :{
            type:String,
            required:true,
        },
        degree :{
            type:String,
            required:true,
        },
        college :{
            type:String,
            required:true,
        },
        yearOfGraduation :{
            type:String,
            required:true,
        },
        jobTitle :{
            type:String,
            required:true,
        },
        lastWorkedCompany :{
            type:String,
            required:true,
        },
        yearsOfExperience :{
            type:Number,
            required:true,
        },
        stack :{
            type:String,
            required:true,
        },
        resume :{
            type:String,
            required:true,
        },
        degreeCertificate :{
            type:String,
            required:true,
        },
        experienceCertificate :{
            type:String,
            required:true,
        },
        isVerified :{
            type:Boolean,
            required: true
        }
    },
    {
        timestamps: true,
    }
)

const MentorVerifyModel = mongoose.model<IMentorVerify>("MentorVarify",mentorValidateSchema)

export default MentorVerifyModel