export const timeSheduleStatus = {
    RESCHEDULED: 'rescheduled',
    CANCELLED: 'cancelled',
} as const;

export type timeSheduleStatuses = typeof timeSheduleStatus[keyof typeof timeSheduleStatus];
