const FriendService = require("../service/FriendService");


class FriendController
{
    async addFriend(req, res)
    {
        try {
            const userId = req.user.id;
            const { friendId } = req.body;
            const friendship = await FriendService.makeFriend(userId, friendId);
            return res.json({
                status: true,
                data: friendship
            });
        } catch (err) {
            return res.status(500).json({
                status: false,
                message: err.message
            });
        }
    }

    async acceptFriend(req, res)
    {
        try {
            const userId = req.user.id; 
            const { friendId } = req.body;
            const friendship = await FriendService.acceptFriend(userId, friendId);
            return res.json({
                status: true,
                data: friendship,
                message: "Friend request accepted"
            });
        }
        catch (err) {
            return res.status(500).json({
                status: false,
                message: err.message
            });
        }   
    }

    async getFriends(req, res)
    {
        try {   
            const userId = req.user.id;
            const friends = await FriendService.getFriends(userId);
            return res.json({
                status: true,
                data: friends
            });
        } catch (err) {
            return res.status(500).json({
                status: false,
                message: err.message
            });
        }   
    }

    async getAcceptedFriends(req, res) {
        try {
            const userId = req.user.id;
            const friends = await FriendService.getAcceptedFriends(userId);
            return res.json({
                status: true,
                data: friends
            });
        } catch (err) {
            return res.status(500).json({
                status: false,
                message: err.message
            });
        }   
    }
}

module.exports = new FriendController();