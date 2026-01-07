const express = require("express");
const path = require("path");
const PostController = require("../app/controller/PostController");
const createUploader = require("../upload/upload");
const router = express.Router()


// upload ảnh + video
const upload = createUploader(path.join(__dirname, "../public/image/posts"), 'both');

router.get("/", PostController.getFeed);

router.get("/me", PostController.getPostId);

router.get("/:id", PostController.show);

router.post("/", upload.array("media", 10), PostController.store);

module.exports = router
