import { Request, Response } from "express-serve-static-core";
import adminService from "../services/adminService";



class adminController {
    constructor(private adminService: adminService) {}

    async adminLogin(req: Request, res: Response): Promise<void>{
        try{
            const admin = req.body
            const adminData = await this.adminService.adminLogin(admin)
            if(adminData){
                res.status(201).json({message:"Success",accessToken:adminData.accessToken,refreshToken:adminData.refreshToken})
            }
        }catch(error){
            if (error instanceof Error) {
                if (error.message === 'Email and password are required') {
                    res.status(409).json({ message: error.message });  
                } else if (error.message === 'Admin does not exist') {
                    res.status(400).json({ message: error.message });  
                } else {
                    console.error(`Invalid password ${error.message}`);
                    res.status(500).json({ message: error.message });
                }
            } else {
                console.error(`Unknown error in Admin: ${error}`);
                res.status(500).json({ message: 'Internal Server Error' });
            }
        }
    }
}

export default adminController