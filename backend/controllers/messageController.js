const asyncHandler = require("express-async-handler");
const Message = require("../Models/messageModel");
const User = require("../Models/userModel");
const Chat = require("../Models/chatModel");

const sendMessage = asyncHandler(async (req, res) => {
  const { content, chatId } = req.body;

  // Check if content and chatId are provided
  if (!content || !chatId) {
    console.log("Invalid data passed into request");
    return res.status(400).json({ message: "Content and chatId are required" });
  }

  // Ensure user is authenticated and available
  if (!req.user || !req.user._id) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  const newMessage = {
    sender: req.user._id, // Sender must come from authenticated user
    content: content,
    chat: chatId,
  };

  try {
    // Create the new message
    let message = await Message.create(newMessage);

    // Populate the necessary fields for the message
    message = await message.populate("sender", "name pic");
    message = await message.populate("chat");
    message = await User.populate(message, {
      path: "chat.users", // Assuming `chat.users` is the list of user IDs
      select: "name pic email",
    });

    // Update the latestMessage field in the chat with the new message
    await Chat.findByIdAndUpdate(chatId, {
      latestMessage: message,
    });

    // Send the created message as a response
    res.json(message);
  } catch (error) {
    console.error("Error while sending message:", error);
    res
      .status(500)
      .json({ message: "Error while sending message", error: error.message });
  }
});

// Fetch all messages for a specific chat
const allMessages = asyncHandler(async (req, res) => {
  try {
    // Get all messages for the chat
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "name pic email") // Populate sender info
      .populate("chat"); // Populate chat details

    res.json(messages); // Return all messages as a response
  } catch (error) {
    console.error("Error fetching messages:", error);
    res
      .status(500)
      .json({ message: "Error fetching messages", error: error.message });
  }
});

module.exports = { sendMessage, allMessages };
