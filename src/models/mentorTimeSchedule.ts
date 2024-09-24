import { Schema, model, Document } from 'mongoose';

export interface IScheduleTime extends Document {
  date: Date;
  startTime: string;
  endTime: string;
  price: number;
  mentorId: Schema.Types.ObjectId; 
  isBooked: boolean;
  bookingId?:unknown; 
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
      type: Boolean,
      required: true,
      default: false, // Default value to avoid undefined states
    },
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: 'BookedSlot',
    },
  },
  { timestamps: true }
);

const ScheduleTime = model<IScheduleTime>('ScheduleTime', scheduleTimeSchema);

export default ScheduleTime;
