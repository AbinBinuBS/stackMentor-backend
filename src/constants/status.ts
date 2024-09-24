export const timeSheduleStatus = {
    RESCHEDULED: 'rescheduled',
    CANCELLED: 'cancelled',
    PENDING : 'pending',
    CONFIRMED : 'confirmed'
} as const;

export type timeSheduleStatuses = typeof timeSheduleStatus[keyof typeof timeSheduleStatus];
