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

    async getMentor(req:Request,res:Response): Promise<void>{
        try{
            const status = req.body.status
            const mentorData = await this.adminService.getMentor(status)
            res.status(200).json({message:"Success" , mentorData})
        }catch(error){
            if(error instanceof Error){
                console.error(`Unknown error in Admin: ${error.message}`);
            }
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }

    async blockMentor(req:Request,res:Response): Promise<void>{
        try{
            const id = req.body.id
            const active = req.body.isActive
            const blocked = await this.adminService.blockMentor(id,active)
            if(blocked){
                res.status(200).json({message:"Mentor unblocked successfully."})
            }else{
                res.status(200).json({message:"Mentor blocked successfully."})
            }
        }catch(error){
            if(error instanceof Error){
                console.error(`Unknown error in Admin: ${error.message}`);
            }
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }

    async getMentorDetails(req:Request,res:Response) : Promise<void>{
        try{
            const id = req.query.id as string;
            const getMentorDta = await this.adminService.getMentorDetails(id)
            res.status(200).json({message:"Success",mentorData:getMentorDta})
        }catch(error){
            if(error instanceof Error){
                console.error(`Unknown error in Admin: ${error.message}`);
            }
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }


    async updateMentorStatus(req:Request,res:Response) : Promise<void>{
        try{
           const {id,status} = req.body
           console.log(req.body)
           const statusUpdate = await this.adminService.updateMentorStatus(id,status)
           if(statusUpdate){
            res.status(200).json({message:"Status updated successfully."})
           }else{
            res.status(500).json({message:"Unknown error occured ,please try again later"})
           }
        }catch(error){
            if(error instanceof Error){
                console.error(`Unknown error in Admin: ${error.message}`);
            }
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }

    async getUsers(req:Request,res:Response): Promise<void>{
        try{
            const userData = await this.adminService.getUsers()
            res.status(200).json({message:"Success" , userData})
        }catch(error){
            if(error instanceof Error){
                console.error(`Unknown error in Admin: ${error.message}`);
            }
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }

    async blockUser(req:Request,res:Response): Promise<void>{
        try{
            const id = req.body.id
            const active = req.body.isActive
            console.log("1111111111111111111111111",req.body)
            const blocked = await this.adminService.blockUser(id,active)
            if(blocked){
                res.status(200).json({message:"User unblocked successfully."})
            }else{
                res.status(200).json({message:"User blocked successfully."})
            }
        }catch(error){
            if(error instanceof Error){
                console.error(`Unknown error in Admin: ${error.message}`);
            }
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }

}

export default adminController