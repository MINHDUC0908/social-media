const Comment = require("../../model/Comment");
const User = require("../../model/User");


class CommentRepository {

    async createComment({ post_id, user_id, content, parent_id = null }) {
        return await Comment.create({
            post_id,
            user_id,
            content,
            parent_id
        });
    }

    async getCommentsByPost(post_id) {
        const comments = await Comment.findAll({
            where: { post_id },
            include: [
                {
                    model: User,
                    as: "user",
                    attributes: ["id", "name", "image_url"]
                }
            ],
            order: [["created_at", "ASC"]]
        });

        // 🔥 Tạo dạng cây: comment và reply
        const map = {};
        const result = [];

        comments.forEach(c => {
            map[c.id] = { ...c.dataValues, replies: [] };
        });

        comments.forEach(c => {
            if (c.parent_id) {
                map[c.parent_id].replies.push(map[c.id]);
            } else {
                result.push(map[c.id]);
            }
        });

        return result; // danh sách comments gốc + replies
    }

    async deleteComment(id, user_id) {
        return await Comment.destroy({
            where: { id, user_id }
        });
    }


    async count(post_id)
    {
        return await Comment.count({
            where: {post_id: post_id}
        })
    }
}

module.exports = new CommentRepository();
