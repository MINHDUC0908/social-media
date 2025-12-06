import axios from "axios";
import { useEffect, useState } from "react";
import api from "../api/api";
import toast from "react-hot-toast";

function Friend()
{
    const [friends, setFriends] = useState([]);
    useEffect(() => {
        const fetchFriends = async () => {
            try {
                const response = await axios.get( api + "friends",
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                        }
                    }
                );
                if (response.data.status === false) {
                    toast.error("Lỗi khi tải lời mời kết bạn");
                    return;
                } else {
                    setFriends(response.data.data);
                }
            } catch (error) {
                console.error("Error fetching friends:", error);
            }   
        };
        fetchFriends();
    }, []); 

    const accept = async (friendId) => {
        console.log("Accepting friend with ID:", friendId);
        try {
            await axios.post(
                api + "friends/accept",
                { friendId: friendId },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    }
                }
            );
            setFriends(friends.filter(item => item.user_id !== friendId));
            toast.success("Đã chấp nhận lời mời kết bạn!");
        } catch (error) {
            console.error("Error accepting friend:", error);
        }
    }
    console.log(friends);
    return (
        <div>
            <div className="bg-white shadow-sm border border-gray-200 p-4 sm:p-6">
                <div className=" mx-auto">
                    <h2 className="text-xl font-semibold mb-4">Lời mời kết bạn</h2>

                    {/* GRID 2 CỘT NHƯ FACEBOOK */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {friends.map((item) => (
                            <div
                                key={item.id}
                                className="bg-white rounded-md border shadow-sm overflow-hidden transition"
                            >
                                {/* Avatar */}
                                <div className="w-full h-40 bg-gray-200 flex items-center justify-center overflow-hidden">
                                    <img
                                        src={
                                            item.user?.image_url ??
                                            "https://ui-avatars.com/api/?background=random&name=" +
                                                item.user?.name
                                        }
                                        alt="avatar"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="p-2">
                                    <p className="text-lg font-semibold text-gray-800">
                                        {item.user?.name}
                                    </p>
                                    <div className="mt-3 space-y-1">
                                        <button onClick={() => accept(item.user_id)} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg flex items-center justify-center gap-2 font-medium text-sm transition">
                                            Xác nhận
                                        </button>

                                        <button className="w-full bg-gray-200 hover:bg-gray-300 text-gray-900 py-2 rounded-lg flex items-center justify-center gap-2 font-medium text-sm transition">
                                            Xóa
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    {friends.length === 0 && (
                        <p className="text-gray-500 text-center mt-6">
                            Không có lời mời kết bạn nào.
                        </p>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Friend;