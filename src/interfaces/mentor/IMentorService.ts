import { IMentor } from "../../models/mentorModel";
import { IScheduleTime } from "../../models/mentorTimeSchedule";
import { INotification } from "../../models/notificationModel";
import { IQa } from "../../models/qaModel";
import { IOtpVerify, TokenResponce } from "../../types/servicesInterfaces/IMentee";
import { EnhancedCommunityMeet, ICOmmunityFormData, IMentorLogin, ISlotMentor, ISlotsList, MentorVerification, MentorVerifyData, RatingResponse } from "../../types/servicesInterfaces/IMentor";



export interface IMentorService {
    createMentor(mentorData: Partial<IMentor>): Promise<IMentor | undefined>
    verifyOtp(otpData: Partial<IOtpVerify>): Promise<TokenResponce | null>
    resendOtp(email: string): Promise<IMentor | undefined>
    mentorLogin(mentorData: Partial<IMentorLogin>): Promise<TokenResponce | null | undefined>
    resetWithEmail(email: string): Promise<IMentor | undefined>
    forgetPasswordVerifyOtp(otpData: Partial<IOtpVerify>) : Promise<IMentor | undefined>
    resetPassword(email:string,password:string): Promise<Boolean | undefined >
    isVerifiedMentor(accessToken: string): Promise<string | undefined>
    verifyMentor(mentorData: MentorVerifyData,token: string): Promise<boolean | undefined>
    createNewRefreshToken(refreshTokenData: string): Promise<TokenResponce>
    scheduleNormalTime(scheduleData: IScheduleTime, mentorId: string): Promise<IScheduleTime[]>
    scheduleWeeklyTime(scheduleData: IScheduleTime, mentorId: string): Promise<IScheduleTime[]>
    scheduleCustomTime(scheduleData: IScheduleTime, mentorId: string): Promise<IScheduleTime[]>
    getScheduledSlots(accessToken:string): Promise< ISlotsList[] | undefined>
    deleteScheduledSlot(id:string): Promise< boolean>
    getBookedSlots(accessToken:string): Promise<ISlotMentor[]>
    getMentorData(mentorId:string): Promise<MentorVerification>
    editProfile(name: string, mentorId: string, imageUrl?: string): Promise<void>
    changePassword(oldPassword:string,newPassword:string,mentorId:string): Promise<boolean>
    cancelSlot(slotId: string): Promise<void>
    allowConnection(bookedId: string): Promise<void>
    endConnection(bookedId: string): Promise<void>
    getAllQuestions(mentorId:string,page:number,limit:number,status:string): Promise<{ questions: IQa[], total: number }>
    submitQAAnswer(questionId:string,mentorId:string,answer:string): Promise<void>
    editQAAnswer(questionId:string,mentorId:string,answer:string): Promise<void>
    createComminityMeet(formData:ICOmmunityFormData,mentorId:string,imageUrl:string): Promise<void>
    getAllCommunityMeet(): Promise<EnhancedCommunityMeet[]>
    getMyCommunityMeet(mentorId:string): Promise<EnhancedCommunityMeet[]>
    cancelCommunityMeet(meetId:string,about:string): Promise<void>
    getMentorRating(mentorId: string,page: number,limit: number): Promise<RatingResponse>
    getNotifications(mentorId:string): Promise<INotification[]>
    markReadChat(mentorId:string,chatId:string): Promise<void>
}