import { ObjectId } from "mongoose";
import { IBookedSlots } from "../../models/bookedSlots";
import { IMentee } from "../../models/menteeModel";
import { IScheduleTime } from "../../models/mentorTimeSchedule";
import { INotification } from "../../models/notificationModel";
import { IQa } from "../../models/qaModel";
import ICheckIsBooked, { BookedSlot, ICombinedData, IMentorShowcase, ISlot } from "../../types/servicesInterfaces/IMentee";
import { EnhancedCommunityMeetCombined } from "../../types/servicesInterfaces/IMentor";



export interface IMenteeRepository {
    menteeRegister(menteeData: Partial<IMentee>,hashedPassword:string,otp:string): Promise<IMentee | undefined>
    findMenteeByEmail(email: string): Promise<IMentee | null>
    findTempModelWithEmail(email: string): Promise<IMentee | null>
    verifyOtp(menteeData: IMentee, otp: string): Promise<IMentee>
    removeTempData(email: string): Promise<void> 
    googleRegister(name:string,email:string,password:string,hashedPassword:string): Promise<IMentee>
    resendOtpVerify(email: string,otp:string): Promise<IMentee | null>
    forgotPasswordWithEmail(menteeData: IMentee): Promise<IMentee | undefined>
    forgetPasswordVerifyOtp(email: string, otp: string): Promise<IMentee>
    resetPassword(mentee:IMentee,hashedPassword:string): Promise<boolean | undefined>
    getMentors(start: number,end: number,stack:string): Promise<Array<IMentorShowcase>>
    getMentorSlots(id: string): Promise<ICombinedData>
    getBookedSlots(userId: string): Promise<BookedSlot[]>
    bookedSlotsById(id:string): Promise<IBookedSlots | null>
    scheduledSlotForMentee(id:ObjectId): Promise<IScheduleTime | null>
    getResheduleList(price:number,bookedSlot: IBookedSlots, schedule: IScheduleTime): Promise<ISlot[]>
    rescheduleBooking(oldBookedSlot:IBookedSlots,oldSchedule:IScheduleTime,newSchedule:IScheduleTime): Promise<boolean>
    checkIsBooked(bookingData: ICheckIsBooked): Promise<boolean>
    editProfile(name: string,menteeId: string,): Promise<void>
    findMenteeById(id: string): Promise<IMentee | undefined>
    changePassword(menteeId: string, newPassword: string): Promise<boolean>
    getWalletData(menteeId: string, page: number, limit: number): Promise<{ mentee: IMentee, total: number }>
    cancelSlot(bookedSlot:IBookedSlots,scheduleTime:IScheduleTime,mentee:IMentee): Promise<void>
    qaQuestion(title:string,body:string,menteeId:string):Promise<void>
    countAllQa(search: string):Promise<number>
    getAllQuestions(page: number, search: string, limit: number): Promise< IQa[] >
    getMeets(page: number, limit: number, search: string, stack: string, date: string): Promise<EnhancedCommunityMeetCombined>
    addReview(menteeId: string,rating: number,comment: string,mentorId: string): Promise<void>
    getNotifications(menteeId: string): Promise<INotification[]>
    markReadChat(menteeId: string,chatId:string): Promise<void>

}