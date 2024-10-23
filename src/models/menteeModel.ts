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
}

const transactionSchema: Schema = new Schema({
    date: {
        type: Date,
        required: true,
        default: Date.now 
    },
    description: {
        type: String,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    transactionType: {
        type: String,
        enum: ['credit', 'debit'], 
        required: true,
    },
    balanceAfterTransaction: {
        type: Number,
        required: true,
    }
}, { _id: false });

const menteeSchema: Schema = new Schema(
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
        wallet: {
            type: Number,
            default: 0, 
        },
        walletHistory: {
            type: [transactionSchema], 
            default: [] 
        }
    },
    {
        timestamps: true,
    }
);

const Mentee = mongoose.model<IMentee>('Mentee', menteeSchema);

export default Mentee;
