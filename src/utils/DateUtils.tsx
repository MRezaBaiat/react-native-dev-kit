import moment from 'jalali-moment';

const fullDateFormat = 'YYYY/MM/DD HH:mm';
const formats = [
  'HH:mm',
  'YYYY/MM/DD HH:mm',
  'YYYY/MM/DD',
  'jYYYY/jMM/jDD HH:mm',
  'jYYYY/jMM/jDD',
]

export type YYYYMMDDHH = string;
export type YYYYMMDD = string;
export type YYYYMMDDHHmm = string;
export type HHmm = string;

type DayType = { name: { fa: string, en: string } }

export interface DaysOfWeek{
  saturday:DayType,
  sunday:DayType,
  monday:DayType,
  tuesday:DayType,
  wednesday:DayType,
  thursday:DayType,
  friday:DayType
}

const days: DaysOfWeek = {
  monday:{
    name:{
      en:'Monday',
      fa:'دوشنبه'
    }
  },
  tuesday:{
    name:{
      en:'Tuesday',
      fa:'سه شنبه'
    }
  },
  wednesday:{
    name:{
      en:'Wednesday',
      fa:'چهارشنبه'
    }
  },
  thursday:{
    name:{
      en:'Thursday',
      fa:'پنجشنبه'
    }
  },
  friday:{
    name:{
      en:'Friday',
      fa:'جمعه'
    }
  },
  saturday:{
    name:{
      en:'Saturday',
      fa:'شنبه'
    }
  },
  sunday:{
    name:{
      en:'Sunday',
      fa:'یکشنبه'
    }
  },
};

const defaultLocale = (language: 'fa' | 'en',georgianParser: boolean)=>{
  moment.locale(language, { useGregorianParser: georgianParser });
};

const formatJalali = (date: any,format: string)=>{
  return moment(date).locale('fa').format(format);
};

const format = (date: any,format: string)=>{
  return moment(date).locale('en').format(format);
};

const toHHmm = (date: string | number | moment.Moment,locale = 'en'): HHmm=>{
  return convertToMoment(date).locale(locale).format('HH:mm');
};

const toYYYYMMDDHHmm = (date: string | number | moment.Moment,locale = 'en'): YYYYMMDDHHmm=>{
  return convertToMoment(date).locale(locale).format('YYYY/MM/DD HH:mm');
};

const toYYYYMMDDHH = (date: string | number | moment.Moment,locale = 'en'): YYYYMMDDHHmm=>{
  return convertToMoment(date).locale(locale).format('YYYY/MM/DD HH');
};

const toYYYYMMDD = (date: string | number | moment.Moment,locale = 'en'): YYYYMMDD=>{
  return convertToMoment(date).locale(locale).format('YYYY/MM/DD');
};

const convertToMoment = (date: number | string | moment.Moment | YYYYMMDDHHmm | YYYYMMDD | HHmm): moment.Moment=>{
  if(typeof date === 'number') {
    return moment(date);
  }else if(typeof date === 'object'){
    return date;
  }else if(date){
    return moment(date,findFormat(date));
  }else{
    return undefined;
  }
};

const isWithingRange = (from: string | moment.Moment,to: string | moment.Moment,offset: number): boolean=>{
  const fromDate = convertToMoment(toYYYYMMDDHHmm(from));
  const toDate = convertToMoment(toYYYYMMDDHHmm(to));
  return toDate.toDate().getTime() - fromDate.toDate().getTime() <= offset;
};

const isInMiddle = (from: string | moment.Moment | number,middle: string | moment.Moment | number,to: string | moment.Moment | number,offset = 0): boolean=>{
  const fromTime = convertToMoment(toYYYYMMDDHHmm(from)).toDate().getTime() - offset;
  const middleTime = convertToMoment(toYYYYMMDDHHmm(middle)).toDate().getTime();
  const toTime = convertToMoment(toYYYYMMDDHHmm(to)).toDate().getTime() + offset;
  return fromTime <= middleTime && toTime >= middleTime;
};

const getDayName = (date: number | string | moment.Moment): keyof DaysOfWeek=>{
  if(typeof date === 'number'){
    date = moment(date).format(fullDateFormat);
  }
  return moment(date,fullDateFormat).format('dddd').toLowerCase() as any;
};

const areInSameDay = (date1: YYYYMMDDHHmm | YYYYMMDD | moment.Moment | number,date2: YYYYMMDDHHmm | YYYYMMDD | moment.Moment | number): boolean=>{
  const d1 = convertToMoment(toYYYYMMDD(date1));
  const d2 = convertToMoment(toYYYYMMDD(date2));

  return d1.toDate().getTime() === d2.toDate().getTime()
};

const findFormat = (date: string): string | undefined=>{
  return formats.find((f: string)=>{
    try{
      const m = moment(date,f);
      if(m.format(f) === date){
        if(m.toDate().getTime() <= 0){
          return undefined;
        }else{
          return f;
        }
      }
      return undefined;
    }catch (e){
      return undefined;
    }
  });
}

const getDay = (date: any,jalali = false): string=>{
  return convertToMoment(date).locale(jalali ? 'fa' : 'en').format('DD');
}

const getMonth = (date: any,jalali = false): string=>{
  return convertToMoment(date).locale(jalali ? 'fa' : 'en').format('DD');
}

const getYear = (date: any,jalali = false): string=>{
  return convertToMoment(date).locale(jalali ? 'fa' : 'en').format('DD');
}


export default {
  Days: days,
  toHHmm,
  toYYYYMMDDHH,
  toYYYYMMDDHHmm,
  toYYYYMMDD,
  findFormat,
  areInSameDay,
  getDayName,
  isInMiddle,
  isWithingRange,
  defaultLocale,
  formatJalali,
  format,
  getDay,
  getMonth,
  getYear
}

