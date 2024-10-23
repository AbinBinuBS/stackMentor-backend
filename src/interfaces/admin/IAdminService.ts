import { IQa } from "../../models/qaModel";
import { IAdminLogin, IAdminMentorList, IAdminUserList, IDashboardData, IMentorConbineData, TokenResponce } from "../../types/servicesInterfaces/IAdmin";
import { EnhancedCommunityMeet } from "../../types/servicesInterfaces/IMentor";


export interface IAdminService {
    adminLogin(adminData: Partial<IAdminLogin>): Promise<TokenResponce | null | undefined>
    getMentor(status: string, page: number, limit: number, searchQuery: string): Promise<{ mentorData: Array<IAdminMentorList>, totalPages: number }>
    blockMentor(id: string,active:boolean): Promise<boolean>
    getMentorDetails(id:string): Promise< IMentorConbineData>
    updateMentorStatus(id:string,status:string): Promise<boolean>
    getUsers(skip: number, limit: number,searchTerm:string): Promise<Array<IAdminUserList>>
    getTotalUsersCount(searchTerm:string): Promise<number>
    blockUser(id: string,active:boolean): Promise<boolean>
    getgraphData(): Promise<IDashboardData>
    createNewRefreshToken(refreshTokenData: string): Promise<TokenResponce> 
    getAllQuestions(page: number, limit: number, status:string): Promise<{ questions: IQa[], totalCount: number }>
    editQAAnswer(questionId:string,answer:string): Promise<void>
    removeQuestion(questionId:string): Promise<void>
    getMeets(): Promise<EnhancedCommunityMeet[]>

}

