const Message = require("../models/messageModel");
const User = require("../models/userModel");
const Chat = require("../models/chatModel");

/**
 * Fetches all messages for a given chat.
 *
 * @param {String} chatId - The ID of the chat for which to fetch messages.
 * @returns {Promise<Array>} A promise that resolves to an array of message objects,
 *                           each populated with sender, receiver, and chat details.
 * @throws Will throw an error if fetching messages fails.
 */

const getAllMessages = async (chatId) => {
  try {
    console.info(`[MESSAGE_SERVICE] Fetching messages for chat: ${chatId}`);

    const messages = await Message.find({ chat: chatId })
      .populate("sender", "name email")
      .populate("reciever")
      .populate("chat");

    console.info(`[MESSAGE_SERVICE] Found ${messages.length} messages`);
    return messages;
  } catch (error) {
    console.error(`[MESSAGE_SERVICE] Error: ${error.message}`, error);
    throw new Error(error.message);
  }
};

/**
 * Sends a new message in a chat.
 *
 * @param {String} userId - The ID of the user sending the message.
 * @param {String} content - The content of the message.
 * @param {String} chatId - The ID of the chat in which to send the message.
 * @returns {Promise<Object>} A promise that resolves to the message object, populated with sender, reciever, and chat details.
 * @throws Will throw an error if sending the message fails.
 */
const sendMessage = async (userId, content, chatId) => {
  if (!content || !chatId) {
    console.warn(`[MESSAGE_SERVICE] Invalid data: Missing content or chatId`);
    throw new Error("Invalid data: Missing content or chatId");
  }

  try {
    console.info(`[MESSAGE_SERVICE] Sending message in chat: ${chatId}`);

    let message = await Message.create({
      sender: userId,
      content: content,
      chat: chatId,
    });

    message = await message.populate("sender", "name pic");
    message = await message.populate("chat");
    message = await message.populate("reciever");
    message = await User.populate(message, {
      path: "chat.users",
      select: "name email",
    });

    await Chat.findByIdAndUpdate(chatId, { latestMessage: message });

    console.info(
      `[MESSAGE_SERVICE] Message sent successfully in chat: ${chatId}`
    );
    return message;
  } catch (error) {
    console.error(`[MESSAGE_SERVICE] Error: ${error.message}`, error);
    throw new Error(error.message);
  }
};

module.exports = { getAllMessages, sendMessage };
