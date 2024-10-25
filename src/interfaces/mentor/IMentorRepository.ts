import { IBookedSlots } from "../../models/bookedSlots";
import { IMentor } from "../../models/mentorModel";
import { IScheduleTime } from "../../models/mentorTimeSchedule";
import { INotification } from "../../models/notificationModel";
import { IQa } from "../../models/qaModel";
import { IRating } from "../../models/ratingModel";
import { IMentorSchema } from "../../models/tempregisterMentor";
import { EnhancedCommunityMeet, ICOmmunityFormData, ISlotMentor, ISlotsList, MentorVerification, MentorVerifyData, RatingCounts } from "../../types/servicesInterfaces/IMentor";



export interface IMentorRepository {
    mentorRegister(mentorData: Partial<IMentor>,hashedPassword:string,otp:string): Promise<IMentorSchema | undefined>
    findMentorTempByEmail(email: string): Promise<IMentorSchema | null>
    findMentorByEmail(email: string): Promise<IMentor | null>
    verifyOtp(mentorData:IMentorSchema): Promise<IMentor>
    removeTempMentor(email: string): Promise<void>
    resendOtpVerify(email: string,otp:string): Promise<IMentor | null>
    forgotPasswordWithEmail(mentorData: IMentor,otp:string): Promise<IMentor | undefined>
    forgetPasswordVerifyOtp(email: string, otp: string): Promise<IMentor>
    resetPassword(mentor:IMentor,hashedPassword:string): Promise<boolean | undefined>
    isVerifiedMentor(id: string): Promise<string | undefined>
    verifyMentorInDatabase(mentorData: MentorVerifyData,id: string): Promise<boolean>
    findMentorById(id: string): Promise<IMentor | undefined>
    findOverlappingSchedule(mentorId: string,occurrenceDate: Date,startTime: string,endTime: string): Promise<IScheduleTime | null>
    getScheduledSlots(id: string, page: number, limit: number, date?: string): Promise<{ totalCount: number; slots: Array<ISlotsList> } | undefined>
    findScheduleById(id: string): Promise<IScheduleTime | null>
    deleteScheduledSlot(id: string): Promise<boolean>
    getBookedSlots(id: string, page: number, limit: number): Promise<{ slots: ISlotMentor[], totalCount: number }>
    getMentorData(mentorId: string): Promise<MentorVerification | undefined>
    updateMentor(name: string,mentorId: string,imageUrl?: string): Promise<void>
    updateMentorVerify(name: string,mentorId: string,imageUrl?: string): Promise<void>
    changePassword(mentorId: string, newPassword: string): Promise<boolean>
    cancelSlot(slotId: string): Promise<void>
    allowConnection(bookedId:string): Promise<void>
    endConnection(bookedId:string): Promise<void>
    getAllQuestions(mentorId: string, page: number, limit: number, status: string): Promise<{ questions: IQa[], total: number }>
    findQaById(id:string): Promise<IQa | null>
    submitQAAnswer(submitAnswer:IQa,mentorId:string,answer:string): Promise<void>
    editQAAnswer(questionId:string,mentorId:string,answer:string): Promise<void>
    createComminityMeet(formData:ICOmmunityFormData,mentorId:string,RoomId:string,imageUrl:string): Promise<void>
    getAllCommunityMeet(): Promise<EnhancedCommunityMeet[]>
    getMyCommunityMeet(mentorId: string): Promise<EnhancedCommunityMeet[]>
    cancelCommunityMeet(meetId:string,about:string): Promise<boolean>
    getMentorRating(mentorId: string, page: number, limit: number, skip: number): Promise<{ratings: IRating[];totalCount: number;ratingCounts: RatingCounts;}>
    getNotifications(mentorId: string): Promise<INotification[]>
    markReadChat(mentorId: string,chatId:string): Promise<void>
}