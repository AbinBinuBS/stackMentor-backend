import mongoose, { Document, Schema } from "mongoose";

export interface IMentorSchema extends Document {
  name: string;
  email: string;
  password: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  otp?: number;
}

const mentortempSchema: Schema = new Schema(
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
    otp: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

mentortempSchema.index({ createdAt: 1 }, { expireAfterSeconds: 1800 });

const MentorTempModel = mongoose.model<IMentorSchema>(
  "TempMentor",
  mentortempSchema
);

export default MentorTempModel;
