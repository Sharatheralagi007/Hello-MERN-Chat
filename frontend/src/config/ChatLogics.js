export const getSender = (loggedUser, users) => {
  // Check if the users array is valid
  if (!users || users.length < 2) {
    console.error("Invalid users array passed to getSender:", users);
    return "Unknown Sender";
  }

  // Determine the sender's name based on the logged-in user
  return users[0]._id === loggedUser._id ? users[1].name : users[0].name;
};

export const getSenderFull = (loggedUser, users) => {
  // Check if the users array is valid
  if (!users || users.length < 2) {
    console.error("Invalid users array passed to getSenderFull:", users);
    return "Unknown Sender";
  }

  // Return the full sender object based on the logged-in user
  return users[0]._id === loggedUser._id ? users[1] : users[0];
};

export const isSameSender = (messages, m, i, userId) => {
  // Check if the next message is from a different sender and not from the logged-in user
  return (
    i < messages.length - 1 &&
    (messages[i + 1].sender._id !== m.sender._id ||
      !messages[i + 1].sender._id) &&
    messages[i].sender._id !== userId
  );
};

export const isLastMessage = (messages, i, userId) => {
  // Check if the current message is the last message from a different sender
  return (
    i === messages.length - 1 &&
    messages[i].sender._id !== userId &&
    messages[i].sender._id
  );
};

export const isSameSenderMargin = (messages, m, i, userId) => {
  // Calculate margin for aligning consecutive messages from the same sender
  if (
    i < messages.length - 1 &&
    messages[i + 1].sender._id === m.sender._id &&
    messages[i].sender._id !== userId
  ) {
    return 33; // Margin for consecutive messages from the same sender
  } else if (
    (i < messages.length - 1 &&
      messages[i + 1].sender._id !== m.sender._id &&
      messages[i].sender._id !== userId) ||
    (i === messages.length - 1 && messages[i].sender._id !== userId)
  ) {
    return 0; // No margin for the last message or when sender changes
  } else {
    return "auto"; // Auto margin for messages from the logged-in user (right alignment)
  }
};

export const isSameUser = (messages, m, i) => {
  // Check if the current message is from the same sender as the previous message
  return i > 0 && messages[i - 1].sender._id === m.sender._id;
};
