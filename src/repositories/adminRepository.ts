import Mentee, { IMentee } from "../models/menteeModel";



class AdminRepository {
    async findAdminByEmail(email: string): Promise<IMentee | null> {
        try {
            const menteeData = await Mentee.findOne({ email }).exec();  
            return menteeData;
        } catch (error: any) {
            console.error(`Error in findMenteeByEmail: ${error.message}`);
            throw new Error(`Unable to find mentee: ${error.message}`);
        }
    }
}

export default AdminRepository;