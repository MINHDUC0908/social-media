
const express = require("express")
const router = express.Router()

const reactions = require("../../../backend/src/app/modules/Reaction/ReactionController")

router.post("/", reactions.create)
router.delete("/delete", reactions.delete)

module.exports = router