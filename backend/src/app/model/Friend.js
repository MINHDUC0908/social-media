const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");
const User = require("./User");

const Friend = sequelize.define("Friend", {
    id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false
    },
    friend_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM("pending","accepted","declined"),
        defaultValue: "pending"
    }
}, {
    tableName: "friends",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false
});

// Associations
Friend.belongsTo(User, { foreignKey: "user_id", as: "user" });
Friend.belongsTo(User, { foreignKey: "friend_id", as: "friend" });

module.exports = Friend;
