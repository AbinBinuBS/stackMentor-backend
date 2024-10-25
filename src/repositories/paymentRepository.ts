import { Types } from "mongoose";
import { timeSheduleStatus } from "../constants/status";
import generateRoomId from "../helper/randomIdHelprt";
import BookedSlots from "../models/bookedSlots";
import Mentee from "../models/menteeModel";
import ScheduleTime, { IScheduleTime } from "../models/mentorTimeSchedule";
import { ITransaction } from "../types/servicesInterfaces/IMentee";
import { IPaymentRepository } from "../interfaces/payment/IPaymentRepository";



class PaymentRepository implements IPaymentRepository{

    async proceedPayment(
		scheduledId: string,
		userId: string
	  ): Promise<IScheduleTime | null> {
		try {
		  const schedule = await ScheduleTime.findById(scheduledId);
		  if (!schedule) {
			throw new Error("Schedule not found");
		  }
	  
		  if (schedule.isBooked) {
			throw new Error("Slot is already booked");
		  }
		  const roomId = await generateRoomId()
		  const bookedSlot = new BookedSlots({
			slotId: schedule._id, 
			userId: userId,
			status: timeSheduleStatus.CONFIRMED,
			roomId,
			isAttended: false,
			isExpired: false,
		  });
	  
		  const savedBookedSlot = await bookedSlot.save();
		  schedule.isBooked = true;
		  schedule.bookingId = savedBookedSlot._id as Types.ObjectId 
	  
		  const updatedSchedule = await schedule.save();
	  
		  return updatedSchedule;
		} catch (error) {
		  if (error instanceof Error) {
			console.error("Error:", error.message);
		  } else {
			console.log("An unknown error occurred");
		  }
		  throw error;
		}
	  }



    async walletPayment(userId: string, slotId: string): Promise<IScheduleTime | null> {
		try {
			const schedule = await ScheduleTime.findById(slotId);
			if (!schedule) {
				throw new Error("Schedule not found");
			}
			if (schedule.isBooked) {
				throw new Error("Slot is already booked");
			}
			const walletBalance = await Mentee.findById(userId);
			if (!walletBalance || walletBalance.wallet === undefined) {
				throw new Error("Wallet balance not found");
			}
			if (walletBalance.wallet < schedule.price) {
				throw new Error("Insufficient balance");
			}
			const roomId = await generateRoomId();
			const bookedSlot = new BookedSlots({
				slotId: schedule._id,
				userId: userId,
				status: timeSheduleStatus.CONFIRMED,
				roomId,
				isAttended: false,
				isExpired: false,
			});
			const savedBookedSlot = await bookedSlot.save();
			schedule.isBooked = true;
			schedule.bookingId = savedBookedSlot._id as Types.ObjectId;
			walletBalance.wallet -= schedule.price;
			if (!walletBalance.walletHistory) {
				walletBalance.walletHistory = []; 
			}
			const transaction: ITransaction = {
				date: new Date(),
				description: `Booked slot for ${schedule.price}`, 
				amount: -schedule.price, 
				transactionType: 'debit',
				balanceAfterTransaction: walletBalance.wallet, 
			};
			walletBalance.walletHistory.push(transaction);
			await walletBalance.save();
			const updatedSchedule = await schedule.save();
			return updatedSchedule;
		} catch (error) {
			if (error instanceof Error) {
				console.error("Error:", error.message);
			} else {
				console.log("An unknown error occurred");
			}
			throw error;
		}
	}    
}

export default PaymentRepository