const { Op } = require("sequelize");
const { Post, User, PostMedia, Reaction } = require("../model");


class PostRepository {
    // Lấy tất cả bài viết của bản thân và bạn bè
    async getPostsByUserIds(userIds) {
        return await Post.findAll({
            where: { user_id: userIds },
            include: [
                { 
                    model: User, 
                    as: "user" ,
                    attributes: ["name", "image_url"]
                },
                { 
                    model: PostMedia, 
                    as: "media",
                    attributes: ["media_url", "media_type"]
                },
                {
                    model: Reaction,
                    as: "reactions",
                    attributes: ["reaction_type", "user_id"]
                }
            ],
            order: [["created_at", "DESC"]]
        });
    }

    async getPostById(id) {
        return await Post.findOne({
            where: { id },
            include: [
                { 
                    model: User, 
                    as: "user", 
                    attributes: ["name", "image_url"]
                },
                { 
                    model: PostMedia, 
                    as: "media" ,
                    attributes: ["id", "media_url"]
                },
                {
                    model: Reaction,
                    as: "reactions",
                    attributes: ["reaction_type", "user_id"]
                }
            ]
        });
    }

    async createPost(data, mediaList) {
        const post = await Post.create(data);

        if (mediaList && mediaList.length > 0) {
            const insert = mediaList.map(media => ({
                post_id: post.id,
                media_url: media.media_url,
                media_type: media.media_type
            }));

            await PostMedia.bulkCreate(insert);
        }

        return post;
    }
}

module.exports = new PostRepository();
