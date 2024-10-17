import mongoose, { Schema, Document } from 'mongoose';

export interface IScheduleTime extends Document {
  scheduleType: 'normal' | 'weekly' | 'custom';
  recurrenceRule: string;
  date: Date | string;
  startDate?: Date | string;
  startTime: string;
  endTime: string;
  price: number;
  mentorId: mongoose.Types.ObjectId;
  isBooked: boolean;
  bookingId?: mongoose.Types.ObjectId;
  customDates?: string;
  daysOfWeek?: number[];
  endDate?: Date | string;
}

const ScheduleTimeSchema: Schema = new Schema({
    scheduleType: { type: String, enum: ['normal', 'weekly', 'custom'] },
    recurrenceRule: { type: String },
    date: { type: Date, required: true },
    startDate: { type: Date },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    price: { type: Number, required: true },
    mentorId: { type: Schema.Types.ObjectId, ref: 'Mentor', required: true },
    isBooked: { type: Boolean, default: false },
    bookingId: { type: Schema.Types.ObjectId, ref: 'BookedSlot' },
    customDates: { type: String },
    daysOfWeek: { type: [Number] },
    endDate: { type: Date }
}, { timestamps: true });

const ScheduleTime = mongoose.model<IScheduleTime>('ScheduleTime', ScheduleTimeSchema);

export default ScheduleTime;