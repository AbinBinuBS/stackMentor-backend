import bcrypt from "bcrypt";

class HashedPassword {
	private static saltRounds: number = 10;

	static async hashPassword(password: string): Promise<string> {
		return bcrypt.hash(password, HashedPassword.saltRounds);
	}

	static async comparePassword(
		password: string,
		hashedPassword: string
	): Promise<boolean> {
		return bcrypt.compare(password, hashedPassword);
	}
}

export default HashedPassword;
