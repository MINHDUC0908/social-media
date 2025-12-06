const ReactionRepository = require("./ReactionRepository");

class ReactionService {
    constructor() {
        this.reactionRepository = ReactionRepository;
    }

    async createReaction(userId, post_id, reaction_type) 
    {
        return this.reactionRepository.createReaction(userId, post_id, reaction_type);
    }

    async deleteReaction(userId, post_id) 
    {
        return this.reactionRepository.deleteReaction(userId, post_id)
    }
}

module.exports = new ReactionService();
