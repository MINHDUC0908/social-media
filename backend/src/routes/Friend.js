const express = require("express")
const router = express.Router()


const friend = require("../app/controller/FriendController")
router.post("/add", friend.addFriend)
router.get("/", friend.getFriends)
router.post("/accept", friend.acceptFriend)
router.get("/accepted", friend.getAcceptedFriends)

module.exports = router