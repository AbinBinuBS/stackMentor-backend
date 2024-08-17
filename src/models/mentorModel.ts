import mongoose, { Document, Schema } from 'mongoose';
import { VerificationStatuses, VerificationStatus } from '../constants/varificationStatus'; 

export interface IMentor extends Document {
  name: string;
  email: string;
  password: string;
  isActive: boolean;
  isVerified?: VerificationStatus; 
  createdAt?: Date;
  updatedAt?: Date;
}

const mentorSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      required: true,
    },
    isVerified: {
      type: String,
      enum: Object.values(VerificationStatuses),
      default: VerificationStatuses.APPLIED,
    },
  },
  {
    timestamps: true,
  }
);

const Mentor = mongoose.model<IMentor>('Mentor', mentorSchema);

export default Mentor;
