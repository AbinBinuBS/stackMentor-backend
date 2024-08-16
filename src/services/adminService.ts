import { IAdminLogin, TokenResponce } from "../interfaces/servicesInterfaces/IAdmin";
import AdminRepository from "../repositories/adminRepository";
import HashedPassword from "../utils/hashedPassword";
import { generateAccessToken, generateRefreshToken } from "../utils/jwtToken";


class AdminService{
    constructor(private adminRepository: AdminRepository) {}
    async adminLogin(adminData: Partial<IAdminLogin>): Promise<TokenResponce | null | undefined> {
        if (!adminData.email || !adminData.password) {
          throw new Error("Email and password are required");
        }
        try {
          const adminRespose = await this.adminRepository.findAdminByEmail(
            adminData.email
          );
          if (!adminRespose) {
            throw new Error("Admin does not exist");
          }
          if(!adminRespose.isAdmin){
            throw new Error("Admin does not exist.")
          }
          if (adminRespose.password) {
              const isPasswordValid = await HashedPassword.comparePassword(
                adminData.password,
                adminRespose.password
              );
              if (isPasswordValid) {
                
                  const userPayload = {
                    id: adminRespose.id,
                    name: adminRespose.name,
                    phone: adminRespose.phone,
                    email: adminRespose.email,
                    isActive: adminRespose.isActive,
                    isAdmin: adminRespose.isAdmin,
                  };
                  let accessToken = generateAccessToken(userPayload)
                  let refreshToken = generateRefreshToken(userPayload)
                  return {accessToken,refreshToken}
              } else {
              throw new Error("Invalid password");
              }
          } else {
            throw new Error("Password is missing for the user");
          }
        } catch (error: unknown) {
          if (error instanceof Error) {
            console.error(error.message);
          } else {
            console.error("An unknown error occurred");
          }
          throw error;
        }
      }
}

export default AdminService