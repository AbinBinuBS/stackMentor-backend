export const JWT_SECRET =
	process.env.JWT_SECRET || "you_cant_find_my_accessToken";
export const REFRESH_TOKEN_SECRET =
	process.env.REFRESH_TOKEN_SECRET || "i_already_said_that_you_can_not_find_it";
export const JWT_EXPIRY = "1h";
export const REFRESH_TOKEN_EXPIRY = "7d";
