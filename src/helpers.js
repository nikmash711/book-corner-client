import moment from 'moment';

const dayNow = moment().calendar(null, {
  sameDay: 'MM/DD/YYYY',
  nextDay: 'MM/DD/YYYY',
  nextWeek: 'MM/DD/YYYY',
  lastDay: 'MM/DD/YYYY',
  lastWeek: 'MM/DD/YYYY',
  sameElse: 'MM/DD/YYYY'
});

export const calculateBalance = mediaArr => {
  let sum = 0;

  for (let media of mediaArr) {
    let now = moment(dayNow, 'MM/DD/YYYY');
    let due = null;
    if (media.dueDate) {
      due = moment(media.dueDate, 'MM/DD/YYYY');
      //Difference in number of days
      let diff = moment.duration(now.diff(due)).asDays();
      //might not be overdue
      if (diff > 0) {
        sum += diff;
      }
    }
  }
  return sum;
};
