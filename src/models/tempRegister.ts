import mongoose, { Document, Schema } from 'mongoose';
import { ITransaction } from '../types/servicesInterfaces/IMentee';

export interface IMentee extends Document {
    name: string;
    email: string;
    password: string;
    phone: string;
    isActive: boolean;
    isAdmin: boolean;
    wallet?: number; 
    createdAt?: Date;
    updatedAt?: Date;
    walletHistory?: ITransaction[];
    otp?: number;
}

const tempSchema: Schema = new Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
        },
        password: {
            type: String,
            required: true,
        },
        phone: {
            type: String,
            required: true,
        },
        isActive: {
            type: Boolean,
            required: true,
        },
        isAdmin: {
            type: Boolean,
            required: true,
        },
        otp: {
            type: Number,
            required: true,
        }
    },
    {
        timestamps: true,
    }
);

tempSchema.index({ createdAt: 1 }, { expireAfterSeconds: 1800 });

const TempModel = mongoose.model<IMentee>('Temp', tempSchema);

export default TempModel;
