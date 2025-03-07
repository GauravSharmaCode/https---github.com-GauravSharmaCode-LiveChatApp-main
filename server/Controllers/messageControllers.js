const expressAsyncHandler = require("express-async-handler");
const messageService = require("../Services/messageService");

const allMessages = expressAsyncHandler(async (req, res) => {
  try {
    const messages = await messageService.getAllMessages(req.params.chatId);
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const sendMessage = expressAsyncHandler(async (req, res) => {
  try {
    const { content, chatId } = req.body;
    const message = await messageService.sendMessage(
      req.user._id,
      content,
      chatId
    );
    res.status(200).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = { allMessages, sendMessage };
