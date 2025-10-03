import dayjs from 'dayjs';
import 'dayjs/locale/tr';

dayjs.locale('tr');

export const formatDateFunc = (dateInput: string | Date) => {
  return dayjs(dateInput).format('DD MMMM YYYY');
};
