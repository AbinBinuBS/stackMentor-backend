import mongoose from "mongoose";

export interface IMessage {
	_id: mongoose.Types.ObjectId;
	sender: {
		_id: mongoose.Types.ObjectId;
		name: string;
		email: string;
	};
	senderModel: string;
	content: string;
	chat: {
		_id: mongoose.Types.ObjectId;
		chatName: string;
		mentor: mongoose.Types.ObjectId;
		mentee: mongoose.Types.ObjectId;
		createdAt: Date;
		updatedAt: Date;
		__v: number;
		latestMessage: mongoose.Types.ObjectId;
	};
	readBy: mongoose.Types.ObjectId[];
	createdAt: Date;
	updatedAt: Date;
	__v: number;
}
