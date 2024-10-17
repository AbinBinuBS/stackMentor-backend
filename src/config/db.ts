import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();
const dbURI: string = process.env.MONGODB_CONNECTION as string;
const connectDB = async () => {
	try {
		await mongoose.connect(dbURI);
		console.log("connected to mongodb")
	} catch (error) {
		console.error("MongoDB connection error:", error);
	}
};

export default connectDB;
