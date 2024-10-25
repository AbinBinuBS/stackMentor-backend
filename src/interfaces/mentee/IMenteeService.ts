import { IMentee } from "../../models/menteeModel";
import { INotification } from "../../models/notificationModel";
import { IQa } from "../../models/qaModel";
import ICheckIsBooked, { BookedSlot, ICombinedData, IMenteeLogin, IMentorShowcase, IOtpVerify, ISlot, TokenResponce, TokenwithCridential } from "../../types/servicesInterfaces/IMentee";
import { EnhancedCommunityMeetCombined } from "../../types/servicesInterfaces/IMentor";


export interface IMenteeService {
    createMentee(menteeData: Partial<IMentee>): Promise<IMentee | undefined>
    menteeLogin(menteeData: Partial<IMenteeLogin>): Promise<TokenResponce | null | undefined>
    checkMenteeMail(email:string): Promise<TokenwithCridential | null | undefined>
    googleRegister(name:string,email:string,password:string): Promise<TokenResponce | null>
    verifyOtp(otpData: Partial<IOtpVerify>): Promise<TokenResponce | null>
    resendOtp(email: string): Promise<IMentee | undefined>
    resetWithEmail(email: string): Promise<IMentee | undefined>
    forgetPasswordVerifyOtp(otpData: Partial<IOtpVerify>) : Promise<IMentee | undefined>
    resetPassword(email:string,password:string): Promise<Boolean | undefined >
    getMentors(level: string , stack:string): Promise<IMentorShowcase[]>
    getMentorSlots(id:string): Promise<ICombinedData >
    getBookedSlots(accessToken:string): Promise<BookedSlot[] >
    getResheduleList(id:string,price:number): Promise<ISlot[] >
    rescheduleBooking(oldId:string,newId:string): Promise<void >
    checkIsBooked(bookingData:ICheckIsBooked): Promise< boolean>
    getMenteeDetails(menteeId:string): Promise<IMentee | undefined>
    editProfile(name: string, menteeId: string): Promise<void>
    createNewRefreshToken(refreshTokenData: string): Promise<TokenResponce>
    changePassword(oldPassword:string,newPassword:string,menteeId:string): Promise<boolean>
    getWalletData(menteeId: string, page: number, limit: number): Promise<{ mentee: IMentee, total: number }>
    cancelSlot(slotId:string): Promise< void>
    qaQuestion(title:string,body:string,menteeId:string): Promise<void>
    getAllQuestions( page:number,search:string): Promise<{ questions: IQa[]; total: number }>
    getMeets(page:number,limit:number,search:string,stack:string,date:string): Promise<EnhancedCommunityMeetCombined>
    addReview(menteeId:string,rating:number,comment:string,mentorId:string): Promise<void>
    getNotifications(menteeId:string): Promise<INotification[]>
    markReadChat(menteeId:string,chatId:string): Promise<void>
}