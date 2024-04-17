const express = require("express");
const { checkAuth } = require("../util/auth");

const router = express.Router();

const chatController = require("../controllers/chatController");

router.use(checkAuth);

router.post("/", chatController.getChats);
router.post("/inbox", chatController.getInboxes);

module.exports = router;
