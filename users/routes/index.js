var express = require("express");
var router = express.Router();
var validate = require("express-validation");
const user = require("../controllers/user.js");
const event = require("../controllers/event");
const user_events = require("../controllers/event_user");
const fs = require("fs");
const isAuthorized = require("../middleware/isAuthorized.js");

router.get("/", function (req, res, next) {
  res.render("index", { error: false });
});

router.post("/v1/create-user", user.registerUser);
router.post("/v1/login", user.login);
router.post("/v1/changePassword", isAuthorized, user.changePassword);
router.post("/v1/resetPass", user.resetPassword);
router.post("/v1/updatePass", user.updatePassword);

// router.post("/v1/filter-user/:skip/:limit", user.filterUser);
router.get("/v1/list-user", user.listUsers);

//EVENTS
router.post("/v1/create-event", isAuthorized, event.createEvent);
router.get("/v1/getList", isAuthorized, event.getEventList);
router.post("/v1/update-event/:id", isAuthorized, event.updateEvent);
router.get("/v1/user-detail", isAuthorized, user_events.userDetail);

//INVITE_USER
router.post("/v1/user_invite", isAuthorized, user_events.userInvite);

module.exports = router;
