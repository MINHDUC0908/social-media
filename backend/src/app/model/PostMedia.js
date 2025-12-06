const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");
const Post = require("./Post");

const PostMedia = sequelize.define("PostMedia", {
    id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
    },
    post_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false
    },
    media_url: {
        type: DataTypes.STRING,
        allowNull: false
    },
    media_type: {
        type: DataTypes.ENUM("image","video"),
        allowNull: false
    }
}, {
    tableName: "post_media",
    timestamps: false
});

// Associations
PostMedia.belongsTo(Post, { foreignKey: "post_id", as: "post", onDelete: "CASCADE", onUpdate: "CASCADE" });
Post.hasMany(PostMedia, { foreignKey: "post_id", as: "media", onDelete: "CASCADE", onUpdate: "CASCADE" });

module.exports = PostMedia;
