import { ObjectId } from "mongoose";
import { VerificationStatus } from "../../constants/varificationStatus";

export interface userPayload{
    id:ObjectId;
    name:string;
    phone?:string;
    email:string;
    isActive:boolean;
    isAdmin?:boolean;
    createdAt?: Date;
    updatedAt?: Date;
}


export interface mentorPayload{
    id:ObjectId;
    name:string;
    email:string;
    isActive:boolean;
    createdAt?: Date;
    updatedAt?: Date;
}


export interface adminPayload{
    id:ObjectId;
    name:string;
    email:string;
    isActive:boolean;
    createdAt?: Date;
    updatedAt?: Date;
}