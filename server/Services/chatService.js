const Chat = require("../models/chatModel");
const User = require("../models/userModel");

const accessChat = async (userId, otherUserId) => {
  try {
    console.info(
      `[CHAT_SERVICE] Accessing chat between users: ${userId} & ${otherUserId}`
    );

    let chat = await Chat.findOne({
      isGroupChat: false,
      users: { $all: [userId, otherUserId] },
    })
      .populate("users", "-password")
      .populate("latestMessage");

    if (!chat) {
      console.info(`[CHAT_SERVICE] No existing chat found, creating new one`);
      chat = await Chat.create({
        isGroupChat: false,
        users: [userId, otherUserId],
      });
      chat = await chat.populate("users", "-password");
    }

    return chat;
  } catch (error) {
    console.error(`[CHAT_SERVICE] Error: ${error.message}`, error);
    throw new Error(error.message);
  }
};

const fetchChats = async (userId) => {
  try {
    console.info(`[CHAT_SERVICE] Fetching chats for user: ${userId}`);

    const chats = await Chat.find({ users: userId })
      .populate("users", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 });

    console.info(`[CHAT_SERVICE] Found ${chats.length} chats`);
    return chats;
  } catch (error) {
    console.error(`[CHAT_SERVICE] Error: ${error.message}`, error);
    throw new Error(error.message);
  }
};

const createGroupChat = async (name, users) => {
  try {
    console.info(`[CHAT_SERVICE] Creating group chat with users: ${users}`);

    const groupChat = await Chat.create({
      chatName: name,
      isGroupChat: true,
      users,
    });

    const fullGroupChat = await groupChat.populate("users", "-password");

    console.info(`[CHAT_SERVICE] Group chat created: ${fullGroupChat._id}`);
    return fullGroupChat;
  } catch (error) {
    console.error(`[CHAT_SERVICE] Error: ${error.message}`, error);
    throw new Error(error.message);
  }
};

module.exports = { accessChat, fetchChats, createGroupChat };
