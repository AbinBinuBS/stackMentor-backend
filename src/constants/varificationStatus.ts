export const VerificationStatuses = {
	BIGINNER: "beginner",
	APPLIED: "applied",
	VERIFIED: "verified",
	REJECTED: "rejected",
} as const;

export type VerificationStatus =
	(typeof VerificationStatuses)[keyof typeof VerificationStatuses];
