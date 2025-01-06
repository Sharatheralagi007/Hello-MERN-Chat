const express = require("express");
const {
  registerUser,
  authUser,
  allUser,
} = require("../controllers/userControllers");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Route to register a new user
router.route("/").get(protect, allUser);
router.route("/").post(registerUser);

// Route to authenticate an existing user
router.post("/login", authUser);

module.exports = router;
