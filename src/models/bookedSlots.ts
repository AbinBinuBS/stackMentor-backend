import { Schema, model, Document, Types } from 'mongoose';
import { timeSheduleStatus, timeSheduleStatuses } from '../constants/status';

export interface IBookedSlots extends Document {
  slotId: Types.ObjectId;
  userId?: Schema.Types.ObjectId;
  isAttended?: boolean;
  isExpired?: boolean;
  status?: timeSheduleStatuses;
}

const bookedSlotSchema: Schema<IBookedSlots> = new Schema(
  {
    slotId: {
      type: Schema.Types.ObjectId,
      ref: 'ScheduleTime',
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'Mentee',
    },
    isAttended: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: Object.values(timeSheduleStatus),
      default: timeSheduleStatus.PENDING,
    },
    isExpired: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const BookedSlots = model<IBookedSlots>('BookedSlot', bookedSlotSchema);

export default BookedSlots;
