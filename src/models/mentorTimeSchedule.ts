import { Schema, model, Document } from 'mongoose';

export interface IScheduleTime extends Document {
  date: Date;
  startTime: string;
  endTime: string;
  price: number;
  category: string;
  about: string;
  image: string; 
  mentorId: Schema.Types.ObjectId; 
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
    category: {
      type: String,
      enum: ['beginner', 'intermediate', 'expert', 'any'],
      required: true,
    },
    about: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    mentorId: {
      type: Schema.Types.ObjectId,
      ref: 'Mentor',
      required: true,
    },
  },
  { timestamps: true }
);

const ScheduleTime = model<IScheduleTime>('ScheduleTime', scheduleTimeSchema);

export default ScheduleTime;
