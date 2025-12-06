const { Op } = require("sequelize");
const { Friend, User } = require("../model");


class FriendRepository
{
    async Makefriend(userId, friendId)
    {
        const friend = await Friend.create({
            user_id: userId,
            friend_id: friendId,
            status: "pending"
        });
        return friend;
    }

    async AcceptFriend(userId, friendId)
    {
        const friendship = await Friend.update( 
            { status: "accepted" },
            { where: { user_id: friendId, friend_id: userId, status: "pending" } },
        );
        return friendship;
    }

    async getFriends(userId)
    {
        return await Friend.findAll({
            where: { friend_id: userId, status: "pending" },
            include: [
                {
                    model: User,
                    as: "user",
                    attributes: ["name", "image_url"]
                }
            ],
            order: [["created_at", "desc"]]
        });
    }


    async getAcceptedFriends(userId) {
        const friends = await Friend.findAll({
            where: {
                status: "accepted",
                // Nghĩa là: chọn các dòng mà user_id = userId hoặc friend_id = userId.
                [Op.or]: [
                    { user_id: userId },
                    { friend_id: userId }
                ]
            }
        });

        // Trả về ID người còn lại trong mối quan hệ
        return friends
    }
}

module.exports = new FriendRepository();