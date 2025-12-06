const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");
const User = require("./User");

const Post = sequelize.define("Post", {
    id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    privacy: {
        type: DataTypes.ENUM("public","friends","private"),
        defaultValue: "public"
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: "posts",
    timestamps: false
});

// Associations
Post.belongsTo(User, { foreignKey: "user_id", as: "user", onDelete: "CASCADE", onUpdate: "CASCADE" });

module.exports = Post;
