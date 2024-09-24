import {
	IExistingMessage,
	menteeChatData,
} from "../interfaces/servicesInterfaces/IMentee";
import Chat from "../models/chatModel";
import MentorVerifyModel from "../models/mentorValidate";

class ChatRepository {
	async menteeConnectChat(
		mentee: menteeChatData,
		mentorId: string
	): Promise<IExistingMessage | null> {
		try {
			let existingChat = await Chat.findOne({
				mentee: mentee.id,
				mentor: mentorId,
			})
				.populate("mentor", "-password")
				.populate("mentee", "-password")
				.populate("latestMessage");

			if (existingChat) {
				return existingChat as unknown as IExistingMessage;
			}

			const newChat = await Chat.create({
				chatName: "Chat between mentor and mentee",
				mentee: mentee.id,
				mentor: mentorId,
			});

			const fullChat = await Chat.findById(newChat._id)
				.populate("mentor", "-password")
				.populate("mentee", "-password")
				.populate("latestMessage");

			if (!fullChat) {
				throw new Error("Something unexpected happened");
			}
			return fullChat as unknown as IExistingMessage;
		} catch (error) {
			console.log(error);
			return null;
		}
	}

	async mentorConnectChat(
		mentee: string,
		mentorId: string
	): Promise<IExistingMessage | null> {
		try {
			const mentorVerification = await MentorVerifyModel.findOne({
				mentorId,
			}).populate("mentorId");

			if (!mentorVerification) {
				throw new Error("something unexpected happened please try again");
			}
			let existingChat = await Chat.findOne({
				mentee: mentee,
				mentor: mentorVerification._id,
			})
				.populate("mentee", "-password")
				.populate("mentor", "-password")
				.populate("latestMessage");

			if (existingChat) {
				return existingChat as unknown as IExistingMessage;
			}

			const newChat = await Chat.create({
				chatName: "Chat between mentor and mentee",
				mentee: mentee,
				mentor: mentorVerification._id,
			});

			const fullChat = await Chat.findById(newChat._id)
				.populate("mentor", "-password")
				.populate("mentee", "-password")
				.populate("latestMessage");
			if (!fullChat) {
				throw new Error("Something unexpected happened");
			}
			return fullChat as unknown as IExistingMessage;
		} catch (error) {
			console.log(error);
			return null;
		}
	}
}

export default ChatRepository;
