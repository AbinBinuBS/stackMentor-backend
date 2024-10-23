import { IMentor } from "../../models/mentorModel";
import { IMentorVerify } from "../../models/mentorValidate";

export interface TokenResponce {
	accessToken: string;
	refreshToken: string;
}

export interface IAdminLogin {
	email: string;
	password: string;
}

export interface IAdminMentorList {
	_id: string;
	name: string;
	email: string;
	isActive: boolean;
	isVerified: string;
}

export interface IAdminUserList {
	_id: string;
	name: string;
	email: string;
	isActive: boolean;
	isVerified: string;
}

export interface IDashboardData {
	monthlyRevenue: number[];
	mentorCount: number;
	menteeCount: number;
}

export interface IMentorConbineData {
    mentorData : IMentorVerify;
    mentor: IMentor
}

export interface IMatchCriteria {
    $or?: Array<{ name: { $regex: string; $options: string; } } | { email: { $regex: string; $options: string; } }>;
    isVerified?: boolean; 
}
