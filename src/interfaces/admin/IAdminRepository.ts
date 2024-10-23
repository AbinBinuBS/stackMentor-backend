import { IMentee } from "../../models/menteeModel";
import { IMentor } from "../../models/mentorModel";
import { IMentorVerify } from "../../models/mentorValidate";
import { IQa } from "../../models/qaModel";
import { IAdminMentorList, IDashboardData, IMentorConbineData } from "../../types/servicesInterfaces/IAdmin";
import { EnhancedCommunityMeet } from "../../types/servicesInterfaces/IMentor";


export interface IAdminRepository {
    findAdminByEmail(email: string): Promise<IMentee | null>
    getMentor(status: string, page: number, limit: number, searchQuery: string): Promise< Array<IAdminMentorList>>
    getMentorCount(status:string,searchQuery:string):Promise<number>
    blockMentor(id: string, active: boolean): Promise<boolean>
    findMentorById(id: string): Promise<IMentor>
    findMentorVerifyById(id: string): Promise<IMentorVerify>
    findMentorByIdAndUpdate(id: string, status: string): Promise<IMentor>
    updateMentorStatus(id: string, status: string): Promise<boolean>
    getUsers(skip: number, limit: number, searchTerm: string): Promise<Array<IAdminMentorList>>
    getTotalUsersCount(searchTerm: string): Promise<number>
    blockUser(id: string, active: boolean): Promise<boolean>
    getGraphData(): Promise<number[]>
    totalMenteeCount(): Promise<number>
    totalMentorCount(): Promise<number>
    findAdminById(id: string): Promise<IMentee | undefined>
    getAllQuestions(skip: number, limit: number, status: Record<string, boolean | string | number | object | undefined>): Promise<IQa[]>
    countQuestions(status: Record<string, boolean | string | number | object | undefined>): Promise<number>
    editQAAnswer(questionId:string,answer:string): Promise<void>
    removeQuestion(questionId:string): Promise<void>
    getMeets(): Promise<EnhancedCommunityMeet[]>
}