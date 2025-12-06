const express = require("express");
const path = require("path");
const PostController = require("../app/controller/PostController");
const createUploader = require("../upload/upload");
const router = express.Router()


// upload ảnh + video
const upload = createUploader(path.join(__dirname, "../public/image/posts"), 'both');

// Lấy danh sách bài viết
router.get("/", PostController.getFeed);

// Chi tiết 1 bài viết
router.get("/:id", PostController.show);

// Tạo bài viết (upload nhiều media)
router.post("/", upload.array("media", 10), PostController.store);

module.exports = router
