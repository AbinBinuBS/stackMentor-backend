import { Schema, model, Document } from 'mongoose';
import { timeSheduleStatus, timeSheduleStatuses } from '../constants/status';

export interface IScheduleTime extends Document {
  date: Date;
  startTime: string;
  endTime: string;
  price: number;
  mentorId: Schema.Types.ObjectId; 
  isBooked:boolean;
  userId?: string; 
  isAttended?: boolean;
  isExpired?:boolean;
  status?:timeSheduleStatuses;
}

const scheduleTimeSchema: Schema<IScheduleTime> = new Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    mentorId: {
      type: Schema.Types.ObjectId,
      ref: 'Mentor',
      required: true,
    },
    isBooked: {
      type:Boolean,
      required:true
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'Mentee'
    },
    isAttended: {
      type: Boolean,
      default: false 
    },
    status: {
      type: String,
      enum: Object.values(timeSheduleStatus),
    },
    isExpired: {
      type: Boolean,
      default: false 
    }
  },
  { timestamps: true }
);

const ScheduleTime = model<IScheduleTime>('ScheduleTime', scheduleTimeSchema);

export default ScheduleTime;
