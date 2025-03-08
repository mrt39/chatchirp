import dayjs from 'dayjs';
import 'dayjs/locale/en-gb'; //import locale

// Custom function to check if two dates are the same day
function isSameDate(date1, date2) {
  const d1 = dayjs(date1);
  const d2 = dayjs(date2);
  return d1.year() === d2.year() && 
         d1.month() === d2.month() && 
         d1.date() === d2.date();
}

//format message dates for display
export function formatMessageDate(timestamp) {
  return dayjs(timestamp).locale('en-gb').format('DD/MM/YYYY HH:mm');
}

//get relative day for message grouping (today, yesterday, etc)
export function getRelativeDay(timestamp) {
  const today = dayjs();
  const messageDate = dayjs(timestamp);
  
  if (isSameDate(messageDate, today)) {
    return 'Today';
  } else if (isSameDate(messageDate, today.subtract(1, 'day'))) {
    return 'Yesterday';
  } else {
    return messageDate.format('DD/MM/YYYY');
  }
}

//group messages by day for display
export function groupMessagesByDay(messages) {
  const groupedMessages = {};
  
  messages.forEach(message => {
    const day = getRelativeDay(parseInt(message.date));
    if (!groupedMessages[day]) {
      groupedMessages[day] = [];
    }
    groupedMessages[day].push(message);
  });
  
  return groupedMessages;
}

//format message time (hour:minute)
export function formatMessageTime(timestamp) {
  return dayjs(parseInt(timestamp)).format('HH:mm');
}

//check if two dates are the same day
export function isSameDay(firstDate, secondDate) {
  return isSameDate(firstDate, dayjs(parseInt(secondDate)));
}

//extract unique message days for grouping
export function extractUniqueDays(messageHistory) {
  const uniqueArray = messageHistory.filter((value, index, self) =>
    index === self.findIndex((t) => (
      isSameDate(dayjs(parseInt(t.date)), dayjs(parseInt(value.date)))
    ))
  );
  
  //sort the dates in ascending order
  const sortedDates = uniqueArray.sort((m1, m2) => 
    (m1.date > m2.date) ? 1 : (m1.date < m2.date) ? -1 : 0
  );
  
  //format dates as day-month-year
  return sortedDates.map(a => dayjs(parseInt(a.date)).format("D MMMM YYYY"));
}

//format text content with emojis, links, etc
export function formatMessageContent(content) {
  //simple implementation - could be expanded with emoji parsing, link detection, etc
  return content;
}