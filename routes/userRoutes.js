const express = require("express");
const { checkAuth } = require("../util/auth");

const router = express.Router();

const userController = require("../controllers/userController");

router.use(checkAuth);

router.post("/", userController.getUsers);
router.post("/search", userController.searchUsers);

module.exports = router;
