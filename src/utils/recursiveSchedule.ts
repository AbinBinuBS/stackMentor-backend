// services/scheduleService.ts

import { RRule } from 'rrule';
import ScheduleTime from '../models/mentorTimeSchedule';

// Function to create a recurring schedule for a mentor
export const createRecurringSchedule = async (
  mentorId: string,
  startDate: Date,
  endDate: Date,
  startTime: string,
  endTime: string,
  daysOfWeek: Array<number>, // Days of the week as [RRule.MO, RRule.WE, RRule.FR, etc.]
  price: number
) => {
  // Define the recurrence rule
  const rule = new RRule({
    freq: RRule.WEEKLY,
    interval: 1, // Repeats every week
    byweekday: daysOfWeek, // Specify the days of the week
    dtstart: new Date(startDate), // When the schedule starts
    until: new Date(endDate), // End date for the recurrence
  });

  // Get all the occurrence dates
  const occurrenceDates = rule.all();

  // Loop through the occurrence dates to create individual schedule entries
  const schedulePromises = occurrenceDates.map((occurrenceDate) => {
    return ScheduleTime.create({
      date: occurrenceDate,
      startTime,
      endTime,
      price,
      mentorId,
      isBooked: false, // Initial state
      recurrenceRule: rule.toString(), // Store the RRULE string for reference
    });
  });

  // Wait for all schedules to be created in the database
  await Promise.all(schedulePromises);
};
