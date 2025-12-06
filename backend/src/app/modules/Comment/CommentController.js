const CommentRepository = require("./CommentRepository");


class CommentController {

    async create(req, res) {
        try {
            const { post_id, content, parent_id } = req.body;
            const user_id = req.user.id;

            if (!content)
                return res.status(400).json({ message: "Nội dung không được bỏ trống" });

            const comment = await CommentRepository.createComment({
                post_id,
                user_id,
                content,
                parent_id: parent_id || null
            });

            const fullComment = await CommentRepository.getCommentsByPost(post_id);

            res.json({
                success: true,
                data: comment,
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Lỗi server" });
        }
    }

    async getByPost(req, res) {
        try {
            const post_id = req.params.post_id;
            const comments = await CommentRepository.getCommentsByPost(post_id);
            const count = await CommentRepository.count(post_id)
            res.json({
                success: true,
                data: comments,
                count: count
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Lỗi server" });
        }
    }
}

module.exports = new CommentController();
