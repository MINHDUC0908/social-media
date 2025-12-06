const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");
const User = require("./User");
const Post = require("./Post");

const Comment = sequelize.define("Comment", {
    id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
    },
    post_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false
    },
    user_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    parent_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true
    }
}, {
    tableName: "comments",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false
});

// Associations
Comment.belongsTo(User, { foreignKey: "user_id", as: "user", onDelete: "CASCADE", onUpdate: "CASCADE" });
Comment.belongsTo(Post, { foreignKey: "post_id", as: "post", onDelete: "CASCADE", onUpdate: "CASCADE" });

module.exports = Comment;
