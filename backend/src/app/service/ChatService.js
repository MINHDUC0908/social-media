// services/ChatService.js
const sequelize = require("../../config/db");
const { Message, Call, User } = require("../model");
const { QueryTypes } = require("sequelize");
const { Op } = require("sequelize");
const fs = require("fs");
const path = require("path");

class ChatService {
    // Lưu tin nhắn mới (mặc định chưa đọc)
    static async saveMessage(senderId, receiverId, content) {
        return await Message.create({
            sender_id: senderId,
            receiver_id: receiverId,
            content,
            is_read: false
        });
    }

    // Lấy tất cả tin nhắn giữa 2 người
    static async getMessages(userA, userB, offset = 0, limit = 20) {
        const messages = await Message.findAll({
            where: {
                [Op.or]: [
                    {
                        [Op.and]: [
                            { sender_id: userA },
                            { receiver_id: userB }
                        ]
                    },
                    {
                        [Op.and]: [
                            { sender_id: userB },
                            { receiver_id: userA }
                        ]
                    }
                ]
            },
            include: [
                {
                    model: User,
                    as: "sender",
                    attributes: [
                        "image_url"
                    ]
                }, 
                {
                    model: Call,
                    as: "call",       
                    required: false
                }
            ], 
            order: [["created_at", "DESC"]],
        });

        return messages.reverse();
    }
    static async getConversations(userId) {
        const chats = await sequelize.query(
            `
            SELECT *
            FROM (
                -- 🟢 Lấy nhóm chat
                SELECT 
                    g.id AS conversationId,
                    g.name AS conversationName,
                    COALESCE(MAX(gm.created_at), g.created_at) AS lastTime,
                    SUBSTRING_INDEX(
                        SUBSTRING_INDEX(GROUP_CONCAT(gm.content ORDER BY gm.created_at DESC), ',', 1),
                        ',', -1
                    ) AS lastMessage,
                    (
                        SELECT u3.id FROM users u3
                        JOIN group_messages m ON m.sender_id = u3.id
                        WHERE m.group_id = g.id
                        ORDER BY m.created_at DESC LIMIT 1
                    ) AS lastSenderId,
                    0 AS unreadCount,
                    NULL AS is_read,
                    1 AS isGroup,
                    (
                        SELECT COUNT(*) 
                        FROM group_members 
                        WHERE group_id = g.id
                    ) AS total_members,
                    NULL AS id,
                    ( 
                        SELECT u3.name FROM users u3 JOIN group_messages m ON m.sender_id = u3.id WHERE m.group_id = g.id ORDER BY m.created_at DESC LIMIT 1 
                    ) AS name,
                    NULL As image_url,
                    NULL AS is_online,
                    NULL AS last_active
                FROM groups g
                JOIN group_members gb ON gb.group_id = g.id
                LEFT JOIN group_messages gm ON gm.group_id = g.id
                WHERE gb.user_id = :userId
                GROUP BY g.id, g.name, g.created_at

                UNION ALL

                -- 🟣 Lấy tất cả bạn bè (1-1) kể cả chưa nhắn
                SELECT 
                    NULL AS conversationId,
                    NULL AS conversationName,
                    MAX(m.created_at) AS lastTime,
                    SUBSTRING_INDEX(
                        SUBSTRING_INDEX(GROUP_CONCAT(m.content ORDER BY m.created_at DESC), ',', 1),
                        ',', -1
                    ) AS lastMessage,
                    (
                        SELECT m2.sender_id FROM messages m2
                        WHERE (m2.sender_id = :userId AND m2.receiver_id = u.id)
                        OR (m2.sender_id = u.id AND m2.receiver_id = :userId)
                        ORDER BY m2.created_at DESC LIMIT 1
                    ) AS lastSenderId,
                    SUM(CASE WHEN m.receiver_id = :userId AND m.is_read = 0 THEN 1 ELSE 0 END) AS unreadCount,
                    (
                        SELECT m3.is_read
                        FROM messages m3
                        WHERE (m3.sender_id = :userId AND m3.receiver_id = u.id)
                        OR (m3.sender_id = u.id AND m3.receiver_id = :userId)
                        ORDER BY m3.created_at DESC
                        LIMIT 1
                    ) AS is_read,
                    0 AS isGroup,
                    NULL AS total_members,
                    u.id,
                    u.name,
                    u.image_url,
                    u.is_online,
                    u.last_active
                FROM users u
                -- Lọc bạn bè
                JOIN friends f 
                    ON (f.user_id = :userId AND f.friend_id = u.id)
                    OR (f.friend_id = :userId AND f.user_id = u.id)
                LEFT JOIN messages m 
                    ON (m.sender_id = :userId AND m.receiver_id = u.id)
                    OR (m.sender_id = u.id AND m.receiver_id = :userId)
                WHERE f.status = 'accepted'
                GROUP BY u.id, u.name, u.email, u.is_online, u.last_active
            ) AS merged
            ORDER BY lastTime DESC;
            `,
            {
                replacements: { userId },
                type: sequelize.QueryTypes.SELECT
            }
        );

        return chats;
    }

    // Đánh dấu tin nhắn là đã đọc
    static async markAsRead(userId, senderId) {
        return await Message.update(
            { is_read: 1 },
            {
                where: {
                    receiver_id: userId,
                    sender_id: senderId,
                    is_read: 0
                }
            }
        );
    }

    static async deleteMessage(messageId)
    {
        try {
            const message = await Message.findByPk(messageId);
            if (!message) return null;

            if (message.image_url) 
            {
                // Xoá file ảnh khỏi server
                const imagePath = path.join(__dirname, "../../public", message.image_url);
                console.log("🗑️ Deleting image file:", imagePath);
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                } else {
                    console.warn("⚠️ File ảnh không tồn tại:", imagePath);
                }
            }

            await message.destroy();
            return true;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = ChatService;