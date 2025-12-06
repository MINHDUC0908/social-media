const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");
const User = require("./User");
const Post = require("./Post");
const Comment = require("./Comment");

const Reaction = sequelize.define("Reaction", {
    id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false
    },
    post_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true
    },
    comment_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true
    },
    reaction_type: {
        type: DataTypes.ENUM("like","love","haha","wow","sad","angry"),
        allowNull: false
    }
}, {
    tableName: "reactions",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false
});

// Associations
Reaction.belongsTo(User, { foreignKey: "user_id", as: "user", onDelete: "CASCADE", onUpdate: "CASCADE" });
Reaction.belongsTo(Post, { foreignKey: "post_id", as: "post", onDelete: "CASCADE", onUpdate: "CASCADE" });
Post.hasMany(Reaction, { foreignKey: "post_id", as: "reactions" });
Reaction.belongsTo(Comment, { foreignKey: "comment_id", as: "comment", onDelete: "CASCADE", onUpdate: "CASCADE" });

module.exports = Reaction;
