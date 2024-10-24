import nodemailer from "nodemailer";
import dotenv from "dotenv";
import crypto from "crypto";

dotenv.config();

export const generateOTP = (): string => {
	const otp = crypto.randomInt(100000, 999999);

	return otp.toString();
};

export const sendVerifyMail = async (
	email: string,
	otp: string
): Promise<void> => {
	const mailTransporter = nodemailer.createTransport({
		service: "gmail",
		auth: {
			user: process.env.USEREMAIL as string,
			pass: process.env.USERPASSWORD as string,
		},
	});
	console.log(otp)
	const mailDetails = {
		from: process.env.USEREMAIL as string,
		to: email,
		subject: `Your OTP is: ${otp}`,
		text: `Your OTP for validation is ${otp}`,
	};

	try {
		await mailTransporter.sendMail(mailDetails);
	} catch (error) {
		console.error("Error occurred while sending email:", error);
	}
};
