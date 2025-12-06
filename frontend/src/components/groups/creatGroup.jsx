import { useState } from "react";
import socket from "../../utils/socket";
import { useAuth } from "../../contexts/AuthContext";
import src from "../../api/src";

function CreateGroup({ setShowCreateGroup, friends }) {
    const [selectedFriends, setSelectedFriends] = useState([]);
    const [groupName, setGroupName] = useState("");
    const { user } = useAuth();

    const toggleFriendSelection = (friendId) => {
        setSelectedFriends(prev =>
            prev.includes(friendId)
                ? prev.filter(id => id !== friendId)
                : [...prev, friendId]
        );
    };

    const handleCreateGroup = () => {
        if (!groupName.trim()) {
            alert("Vui lòng nhập tên nhóm");
            return;
        }
        if (selectedFriends.length < 2) {
            alert("Vui lòng chọn ít nhất 2 thành viên");
            return;
        }

        socket.emit("create_group", {
            name: groupName,
            members: selectedFriends,
            creatorId: user?.id,
        });

        setShowCreateGroup(false);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 max-h-[85vh] overflow-hidden">
                <div className="relative border-b border-gray-200">
                    <button
                        onClick={() => {
                            setShowCreateGroup(false);
                            setGroupName("");
                            setSelectedFriends([]);
                        }}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-900"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                    <h3 className="text-center text-lg font-semibold text-gray-900 py-4">
                        Tạo nhóm mới
                    </h3>
                    <button
                        onClick={handleCreateGroup}
                        disabled={selectedFriends.length < 2 || !groupName.trim()}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-500 font-semibold hover:text-blue-600 disabled:text-gray-300 disabled:cursor-not-allowed"
                    >
                        Tạo
                    </button>
                </div>
                <div className="overflow-y-auto max-h-[calc(85vh-65px)]">
                    <div className="p-4 border-b border-gray-100">
                        <input
                            type="text"
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                            placeholder="Tên nhóm"
                            className="w-full px-4 py-3 bg-gray-50 rounded-xl text-base focus:outline-none focus:bg-gray-100 transition"
                            autoFocus
                        />
                    </div>
                    {selectedFriends.length > 0 && (
                        <div className="px-4 py-3 bg-blue-50 border-b border-blue-100">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-sm font-medium text-blue-900">
                                    Đã chọn {selectedFriends.length} thành viên
                                </span>
                                <button
                                    onClick={() => setSelectedFriends([])}
                                    className="ml-auto text-xs text-blue-600 hover:text-blue-800 font-medium"
                                >
                                    Bỏ chọn tất cả
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {selectedFriends.map(friendId => {
                                    const friend = friends.find(f => f.id === friendId);
                                    return friend ? (
                                        <div
                                            key={friendId}
                                            className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full shadow-sm"
                                        >
                                            <img
                                                src={
                                                    friend.image_url
                                                        ? src + friend.image_url
                                                        : "https://cdn-icons-png.flaticon.com/512/4825/4825038.png"
                                                }
                                                className="w-5 h-5 rounded-full object-cover"
                                            />
                                            <span className="text-sm text-gray-700">{friend.name}</span>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleFriendSelection(friendId);
                                                }}
                                                className="ml-1 text-gray-400 hover:text-gray-600"
                                            >
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    ) : null;
                                })}
                            </div>
                        </div>
                    )}
                    <div className="p-4">
                        <div className="mb-3">
                            <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                                Gợi ý
                            </span>
                        </div>
                        <div className="space-y-1">
                            {friends.map((friend) => {
                                const isSelected = selectedFriends.includes(friend.id);
                                return (
                                    <div
                                        key={friend.id}
                                        onClick={() => toggleFriendSelection(friend.id)}
                                        className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-gray-50 transition"
                                    >
                                        <div className="relative">
                                            <img
                                                src={
                                                    friend.image_url
                                                        ? src + friend.image_url
                                                        : "https://cdn-icons-png.flaticon.com/512/4825/4825038.png"
                                                }
                                                className="w-12 h-12 rounded-full object-cover"
                                            />
                                            {isSelected && (
                                                <div className="absolute inset-0 bg-blue-500 bg-opacity-20 rounded-full flex items-center justify-center">
                                                    <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-gray-900 truncate">
                                                {friend.name}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {friend.is_online ? 'Đang hoạt động' : 'Không hoạt động'}
                                            </p>
                                        </div>
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                            isSelected 
                                                ? 'bg-blue-500 border-blue-500' 
                                                : 'border-gray-300'
                                        }`}>
                                            {isSelected && (
                                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CreateGroup;
