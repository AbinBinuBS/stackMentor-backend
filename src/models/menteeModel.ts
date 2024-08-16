import mongoose, { Document, Schema } from 'mongoose';

export interface IMentee extends Document {
    name: string;
    email: string;
    password: string;
    phone: string;
    isActive: boolean;
    isAdmin: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

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
    },
    {
        timestamps: true,
    }
);

const Mentee = mongoose.model<IMentee>('Mentee', menteeSchema);

export default Mentee;
