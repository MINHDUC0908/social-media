const ReactionService = require("./ReactionService");

class ReactionController {
    async create(req, res) 
    {
        const userId = req.user.id;
        const { post_id, reaction_type } = req.body;

        try {
            // Dùng await vì method là async
            const data = await ReactionService.createReaction(userId, post_id, reaction_type);

            return res.json({
                data: data,
                success: true,
                message: `Bạn đã ${reaction_type} bài viết`
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    async delete(req, res)
    {
        const userId = req.user.id;
        const { post_id } = req.body;
        try {
            const data = await ReactionService.deleteReaction(userId, post_id)
            return res.json({
                data: data,
                success: true,
                message: `Bạn đã xóa cảm xúc bài viết`
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
}

module.exports = new ReactionController();
