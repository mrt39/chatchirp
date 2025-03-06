import dayjs from 'dayjs';
import 'dayjs/locale/en-gb'; //import locale

// format message dates for display
export const formatMessageDate = (timestamp) => {
  return dayjs(timestamp).locale('en-gb').format('DD/MM/YYYY HH:mm');
};

//get relative day for message grouping (today, yesterday, etc)
export const getRelativeDay = (timestamp) => {
  const today = dayjs();
  const messageDate = dayjs(timestamp);
  
  if (messageDate.isSame(today, 'day')) {
    return 'Today';
  } else if (messageDate.isSame(today.subtract(1, 'day'), 'day')) {
    return 'Yesterday';
  } else {
    return messageDate.format('DD/MM/YYYY');
  }
};

//group messages by day for display
export const groupMessagesByDay = (messages) => {
  const groupedMessages = {};
  
  messages.forEach(message => {
    const day = getRelativeDay(message.timestamp);
    if (!groupedMessages[day]) {
      groupedMessages[day] = [];
    }
    groupedMessages[day].push(message);
  });
  
  return groupedMessages;
};

//format text content with emojis, links, etc
export const formatMessageContent = (content) => {
  //simple implementation - could be expanded with emoji parsing, link detection, etc
  return content;
};