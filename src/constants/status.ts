export const timeSheduleStatus = {
	RESCHEDULED: "rescheduled",
	CANCELLED: "cancelled",
	PENDING: "pending",
	CONFIRMED: "confirmed",
	COMPLETED: "completed",
} as const;

export type timeSheduleStatuses =
	(typeof timeSheduleStatus)[keyof typeof timeSheduleStatus];
