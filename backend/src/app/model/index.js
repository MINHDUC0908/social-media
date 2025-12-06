const sequelize = require("../../config/db");
const Call = require("./Call");
const Comment = require("./Comment");
const Friend = require("./Friend");
const Group = require("./Group");
const GroupMember = require("./GroupMember");
const GroupMessage = require("./GroupMessage");
const GroupMessageRead = require("./GroupMessageRead");
const Message = require("./Message");
const Post = require("./Post");
const PostMedia = require("./PostMedia");
const Reaction = require("./Reaction");
const User = require("./User");

const syncDatabase = async () => {
    try {
        await sequelize.authenticate();
        console.log("✅ Kết nối database thành công!");
        
        await sequelize.sync({ alter: true }); // Đồng bộ Model với DB
        console.log("✅ Database đã được đồng bộ!");
    } catch (error) {
        console.error("❌ Lỗi kết nối database:", error);
    }
};

module.exports = { syncDatabase, User, Group, GroupMember, Message, GroupMessage, GroupMessageRead, Call, Post, PostMedia, Reaction, Comment, Friend };