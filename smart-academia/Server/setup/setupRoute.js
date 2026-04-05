const express = require("express");
const router = express.Router();
const { getSetupStatus, createAdmin } = require("./setupController");

router.get("/status", getSetupStatus);
router.post("/create-admin", createAdmin);

module.exports = router;