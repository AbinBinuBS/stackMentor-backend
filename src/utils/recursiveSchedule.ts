
import { RRule } from 'rrule';
import ScheduleTime from '../models/mentorTimeSchedule';

export const createRecurringSchedule = async (
  mentorId: string,
  startDate: Date,
  endDate: Date,
  startTime: string,
  endTime: string,
  daysOfWeek: Array<number>, 
  price: number
) => {
  const rule = new RRule({
    freq: RRule.WEEKLY,
    interval: 1, 
    byweekday: daysOfWeek, 
    dtstart: new Date(startDate),
    until: new Date(endDate), 
  });

  const occurrenceDates = rule.all();

  const schedulePromises = occurrenceDates.map((occurrenceDate) => {
    return ScheduleTime.create({
      date: occurrenceDate,
      startTime,
      endTime,
      price,
      mentorId,
      isBooked: false, 
      recurrenceRule: rule.toString(), 
    });
  });

  await Promise.all(schedulePromises);
};
