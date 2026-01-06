const express = require("express")
const router = express.Router()

const authRoutes = require("./Auth")
const chatRoutes = require("./Chat")
const groupRoutes = require("./Group")
const userRoutes = require("./User")
const imageRoutes = require("./Image")
const reactionRoutes = require("./Reaction")
const comment = require("./Comment")
const authMiddleware = require("../app/middleware/authMiddleware")

function route(app)
{
    app.use("/auth", authRoutes)
    app.use("/profile", authMiddleware, (req, res) => {
        res.json({ user: req.user })
    })
    app.use("/users", authMiddleware, userRoutes)
    app.use("/chat", authMiddleware, chatRoutes)
    app.use("/group", authMiddleware, groupRoutes)
    app.use("/image", authMiddleware, imageRoutes)
    app.use("/posts", authMiddleware, require("./Post"))
    app.use("/friends", authMiddleware, require("./Friend"))
    app.use("/reaction", authMiddleware, reactionRoutes)
    app.use("/comment", authMiddleware, comment)
    app.use("/", authMiddleware, require("./fileRoutes"))
    // routes/user.routes.js hoặc auth.routes.js
}

module.exports = route