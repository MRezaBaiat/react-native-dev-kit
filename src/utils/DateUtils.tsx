import PersianCalendarService from './PersianCalendarService';

export default class DateUtils {

  static longToDate(date : number) : Date {
    return new Date(date);
  }

  static longToPersianDateString(date : number) : string {
    return new PersianCalendarService().PersianCalendar(new Date(date));
  }
}
