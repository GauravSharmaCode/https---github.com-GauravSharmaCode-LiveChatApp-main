const express = require("express");
const {
  accessChat,
  fetchChats,
  createGroupChat,
  groupExit,
  fetchGroups,
} = require("../controllers/chatControllers"); // Fix naming to match correct file
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, accessChat);
router.get("/", protect, fetchChats);
router.post("/createGroup", protect, createGroupChat);
router.get("/fetchGroups", protect, fetchGroups);
router.put("/groupExit", protect, groupExit);

module.exports = router;
