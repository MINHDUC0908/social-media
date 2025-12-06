const FriendRepository = require("../repository/FriendRepository");
const admin = require("../../config/firebase");
const { User } = require("../model");
const UserRepository = require("../repository/UserRepository");

class FriendService {
    async makeFriend(userId, friendId) {
        const friendship = await FriendRepository.Makefriend(userId, friendId);
        const sender = await User.findByPk(userId);
        const receiver = await User.findByPk(friendId);

        if (receiver && receiver.fcm_token) {
            try {
                const result = await admin.messaging().send({
                    token: receiver.fcm_token,
                    notification: {
                        title: "Lời mời kết bạn mới",
                        body: `${sender.name} đã gửi lời mời kết bạn cho bạn`
                    },
                    data: {
                        type: "friend_request",
                        from_user_id: String(userId),
                        from_user_name: sender.name,
                        image: sender.image_url || "",
                        click_action: "/friends"
                    }
                });

            } catch (error) {
                console.error("❌ Error sending notification:", error.code);
                // Xóa token không hợp lệ khỏi database
                if (error.code === 'messaging/registration-token-not-registered' ||
                    error.code === 'messaging/invalid-registration-token') {
                    console.log("🗑️ Removing invalid token from database");
                    await receiver.update({ fcm_token: null });
                }
            }
        } else {
            console.log("⚠️ Receiver doesn't have FCM token");
        }
        return friendship;
    }


    async getFriends(userId) {
        return await FriendRepository.getFriends(userId);
    }

    async acceptFriend(userId, friendId) {
        const friendship = await FriendRepository.AcceptFriend(userId, friendId);
        return friendship;
    }

    async getAcceptedFriends(userId) {
        const data = await FriendRepository.getAcceptedFriends(userId);
        const friendIds = data.map(f => (f.user_id === userId ? f.friend_id : f.user_id));
        
        return await User.findAll({
            where: {
                id: friendIds
            },
            attributes: { exclude: ['password', "fcm_token", "updatedAt", "createdAt", "last_active","email"] }
        });
    }
}

module.exports = new FriendService();