const PostService = require("../service/PostService");

class PostController {
    async getPostId(req, res) {
        try {
            const userId = req.user.id;
            console.log("🚀 Fetching posts for user ID:", userId);
            
            const post = await PostService.getPostId(userId);
            if (!post) {
                return res.status(404).json({
                    status: false,
                    message: "Không tìm thấy bài viết!"
                });
            }   
            return res.json({
                status: true,
                data: post
            });
        } catch (err) {
            return res.status(500).json({
                status: false,
                message: err.message,
                userId: req.user.id
            });
        }
    }

    async getFeed(req, res) {
        try {
            const userId = req.user.id;
            const posts = await PostService.getFeed(userId);
            return res.json({
                status: true,
                data: posts
            });
        }catch (err) {
            return res.status(500).json({
                status: false,  
                message: err.message,
            });
        }
    }
    // GET /posts/:id
    async show(req, res) {
        try {
            const post = await PostService.showPost(req.params.id);

            if (!post) {
                return res.status(404).json({
                    status: false,
                    message: "Không tìm thấy bài viết!"
                });
            }

            return res.json({
                status: true,
                data: post
            });
        } catch (err) {
            return res.status(500).json({
                status: false,
                message: err.message
            });
        }
    }

    // POST /posts
    async store(req, res) {
        try {
            const { user_id, content, privacy } = req.body;
            let mediaList = [];

            // Nhận file từ multer
            if (req.files && req.files.length > 0) {
                mediaList = req.files.map(file => ({
                    media_url: "/image/posts/" + file.filename,
                    media_type: file.mimetype.startsWith("video") ? "video" : "image"
                }));
            }

            const post = await PostService.createPost(
                user_id,
                content,
                privacy,
                mediaList
            );

            return res.json({
                status: true,
                message: "Đã đăng bài viết thành công!",
                data: post
            });
        } catch (err) {
            return res.status(500).json({
                status: false,
                message: err.message
            });
        }
    }
}

module.exports = new PostController();
