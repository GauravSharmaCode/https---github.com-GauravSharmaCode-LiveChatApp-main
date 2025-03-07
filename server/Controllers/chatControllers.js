const expressAsyncHandler = require("express-async-handler");
const chatService = require("../Services/chatService");

const accessChat = expressAsyncHandler(async (req, res) => {
  try {
    const chat = await chatService.accessChat(req.user._id, req.body.userId);
    res.status(200).json(chat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const fetchChats = expressAsyncHandler(async (req, res) => {
  try {
    const chats = await chatService.fetchChats(req.user._id);
    res.status(200).json(chats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const createGroupChat = expressAsyncHandler(async (req, res) => {
  try {
    const { name, users } = req.body;
    if (!name || !users || users.length < 2) {
      return res
        .status(400)
        .json({ message: "Group chat needs at least 3 users" });
    }

    const groupChat = await chatService.createGroupChat(name, [
      ...users,
      req.user._id,
    ]);
    res.status(201).json(groupChat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const groupExit = expressAsyncHandler(async (req, res) => {
  try {
    const { groupId } = req.body;
    const result = await chatService.groupExit(req.user._id, groupId);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const fetchGroups = expressAsyncHandler(async (req, res) => {
  try {
    const groups = await chatService.fetchGroups(req.user._id);
    res.status(200).json(groups);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = {
  accessChat,
  fetchChats,
  createGroupChat,
  groupExit,
  fetchGroups,
};
