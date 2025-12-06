const CommentRepository = require("../modules/Comment/CommentRepository");
const ReactionRepository = require("../modules/Reaction/ReactionRepository");
const FriendRepository = require("../repository/FriendRepository");
const PostRepository = require("../repository/PostRepository");

class PostService 
{
    constructor() {
        this.postRepository = PostRepository;
    }

   async getFeed(userId) {
        // 1. Lấy danh sách bạn bè
        const friends = await FriendRepository.getAcceptedFriends(userId);

        const friendIds = friends.map(f => (f.user_id === userId ? f.friend_id : f.user_id));

        // 2. Thêm chính user_id vào mảng để lấy luôn bài của mình
        friendIds.push(userId);
        

        // 3. Lấy bài viết của tất cả người trong mảng
        const posts = await this.postRepository.getPostsByUserIds(friendIds);
        const result = [];

        for (let post of posts) {
            const reaction = await ReactionRepository.getReactionByUser(
                userId,
                post.id
            );
            const countComment = await CommentRepository.count(post.id)

            result.push({
                ...post.toJSON(),               // Chuyển về object để serialize đầy đủ
                user_reacted: reaction ? reaction.reaction_type : null,
                count: countComment
            });
        }
        return result;
    }

    async showPost(id) {
        const post = await this.postRepository.getPostById(id);

        const result = [];
        const reaction = await ReactionRepository.getReactionByPost(
            post.id
        );
        result.push({
            ...post.toJSON(),               // Chuyển về object để serialize đầy đủ
            user_reacted: reaction ? reaction.reaction_type : null
        });
        return result;
    }

    async createPost(user_id, content, privacy, media) 
    {
        const data = {
            user_id,
            content,
            privacy: privacy || "public"
        };

        const post = await this.postRepository.createPost(data, media);

        const database = await this.postRepository.getPostById(post.id);

        return database;
    }
}

module.exports = new PostService();
