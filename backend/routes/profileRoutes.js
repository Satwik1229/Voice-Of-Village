const express = require("express");
const router = express.Router();
const { getProfile, changePassword } = require("../controllers/profileController");

router.get("/:id", getProfile);
router.put("/:id/change-password", changePassword);

module.exports = router;
