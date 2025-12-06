const express = require("express")
const router = express.Router()

const comment = require("../app/modules/Comment/CommentController")

router.post("/add", comment.create);
router.get("/:post_id", comment.getByPost)

module.exports = router