const { User } = require("../model");
const UserService = require("../service/UserService");
const path = require("path");
const fs = require("fs");
const createUploader = require("../../upload/upload");

// Khởi tạo uploader với thư mục lưu ảnh
const upload = createUploader(path.join(__dirname, "../../public/image/users"));

class UserController {
    async getAllUsers(req, res) {
        try {
            const users = await UserService.getAllUsers(req.user.id);
            res.status(200).json(users);
        } catch (error) {
            res.status(500).json({ message: "Lỗi server", error: error.message });
        }
    }

    async getUser(req, res) {
        try {
            const userId = req.user.id;
            const result = await UserService.getUser(userId);

            if (result.data) {
                return res.status(200).json(result.data);
            } else {
                return res.status(404).json({ message: "User not found" });
            }
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }


    async uploadImage(req, res) {
        try {
            const userId = req.user.id;
            const user = await User.findByPk(userId);

            if (!user) {
                return res.status(404).json({ message: "Người dùng không tồn tại" });
            }

            if (!req.file) {
                return res.status(400).json({ message: "Không có file nào được tải lên!" });
            }

            // Xóa ảnh cũ nếu tồn tại
            if (user.image_url) {
                const oldImagePath = path.join(__dirname, "../../public", user.image_url);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }

            // Cập nhật ảnh mới
            const imageUrl = `/image/users/${req.file.filename}`;
            await User.update(
                { image_url: imageUrl },
                { where: { id: userId } }
            );

            return res.status(201).json({
                success: true,
                message: "Tải lên thành công!",
                image: imageUrl
            });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Lỗi server", error: error.message });
        }
    }
}

module.exports = { userController: new UserController(),  upload}
