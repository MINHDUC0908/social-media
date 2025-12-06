const { Reaction } = require("../../model");

class ReactionRepository 
{
    async createReaction(user_id, post_id, reaction_type) {
        return Reaction.upsert({
            user_id,
            post_id,
            reaction_type
        });
    }

    async getReactionByUser(userId, post_id) {
        return Reaction.findOne({
            where: { user_id: userId, post_id }
        });
    }

    async getReactionByPost(post_id)
    {
        return Reaction.findOne({
            where: { post_id }
        });
    }

    async deleteReaction(userId, post_id) {
        return Reaction.destroy({
            where: { user_id: userId, post_id }
        })
    }
}

module.exports = new ReactionRepository();
