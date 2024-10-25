import { IScheduleTime } from "../../models/mentorTimeSchedule"






export interface IPaymentRepository {
    proceedPayment(scheduledId: string,userId: string): Promise<IScheduleTime | null>
    walletPayment(userId: string, slotId: string): Promise<IScheduleTime | null>
}