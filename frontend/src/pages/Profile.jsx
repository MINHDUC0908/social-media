import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";
import api from "../api/api";
import src from "../api/src";

function Profile({ profile, setProfile }) 
{
    console.log(profile)
    const [showImageModal, setShowImageModal] = useState(false);
    const [previewImage, setPreviewImage] = useState("");
    const [uploading, setUploading] = useState(false);
    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);

        const form = new FormData();
        form.append("image_url", file);

        try {
            const res = await axios.post(api + "users/upload-image", form, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                    "Content-Type": "multipart/form-data",
                },
            });
            const { success, image } = res.data;
            if (success) {
                setProfile((prev) => ({ ...prev, image_url: image })); // cập nhật ảnh mới ngay trên UI
            }
        } catch (err) {
            console.error("Upload error:", err);
        } finally {
            setUploading(false)
        }
    };

    if (uploading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="relative w-24 h-24 mx-auto mb-6">
                        <div className="absolute inset-0 border-4 border-indigo-200 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-transparent border-t-indigo-600 rounded-full animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                                </svg>
                            </div>
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-indigo-600 mb-2">VibeConnect</h2>
                    <p className="text-gray-500 text-sm">Đang tải...</p>
                    <div className="flex justify-center gap-2 mt-4">
                        <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                        <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto">
                    <div className="h-96 bg-gradient-to-br from-blue-400 to-indigo-500"></div>
                    <div className="px-4 pb-4">
                        <div className="flex items-end justify-between -mt-8">
                            <div className="flex items-end gap-4">
                                <div className="relative">
                                    <img 
                                        src={profile.image_url == null ? "https://cdn-icons-png.flaticon.com/512/4825/4825038.png" : src + profile.image_url}
                                        alt="Avatar" 
                                        className="w-40 h-40 rounded-full border-4 border-white cursor-pointer object-cover"
                                        onClick={() => {
                                            setPreviewImage(src + profile?.image_url );
                                            setShowImageModal(true);
                                        }}
                                    />

                                    {/* Nút đổi ảnh */}
                                    <label className="absolute bottom-2 right-2 bg-gray-900 bg-opacity-70 p-2 rounded-full cursor-pointer">
                                        <input 
                                            type="file" 
                                            accept="image/*" 
                                            className="hidden"
                                            onChange={(e) => handleAvatarChange(e)}
                                        />
                                        <span className="text-white text-xs">✏️</span>
                                    </label>
                                </div>
                                <div className="pb-2">
                                    <h1 className="text-3xl font-bold text-gray-900">John Doe</h1>
                                    <p className="text-gray-600">1.2K friends</p>
                                </div>
                            </div>
                            <div className="flex gap-2 pb-2">
                                <button className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-md hover:bg-blue-700">
                                    Add to story
                                </button>
                                <button className="px-4 py-2 bg-gray-200 text-gray-900 text-sm font-semibold rounded-md hover:bg-gray-300">
                                    Edit profile
                                </button>
                            </div>
                        </div>
                        
                        {/* Tabs */}
                        {/* <div className="border-t mt-4 pt-1 -mb-4 -mx-4 px-4">
                            <div className="flex gap-2">
                                {['Posts', 'About', 'Friends', 'Photos', 'Videos', 'More'].map((tab, i) => (
                                    <button 
                                        key={tab}
                                        className={`px-4 py-3 text-sm font-semibold rounded-md ${
                                            i === 0 
                                            ? 'text-blue-600 border-b-4 border-blue-600' 
                                            : 'text-gray-600 hover:bg-gray-100'
                                        }`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>
                        </div> */}
                    </div>
                </div>
            </div>
            {showImageModal && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
                    onClick={() => setShowImageModal(false)}
                >
                    <img 
                        src={previewImage} 
                        className="max-w-[90%] max-h-[90%] rounded-lg shadow-2xl"
                        onClick={(e) => e.stopPropagation()} 
                    />
                    <button 
                        className="absolute top-6 right-6 text-white text-3xl font-bold"
                        onClick={() => setShowImageModal(false)}
                    >
                        ✕
                    </button>
                </div>
            )}

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 py-4">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                    <div className="lg:col-span-2 space-y-4">
                        <div className="bg-white rounded-lg shadow p-4">
                            <h2 className="text-xl font-bold mb-4">Intro</h2>
                            <p className="text-center text-gray-700 mb-4">
                                Building the future one line of code at a time
                            </p>
                            <button className="w-full py-2 bg-gray-200 text-gray-900 text-sm font-semibold rounded-md hover:bg-gray-300">
                                Edit bio
                            </button>
                            
                            <div className="mt-4 space-y-3">
                                <div className="flex items-center gap-3 text-sm">
                                    <span className="text-gray-500">💼</span>
                                    <span className="text-gray-900">Works at <strong>Meta</strong></span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <span className="text-gray-500">🎓</span>
                                    <span className="text-gray-900">Studied at <strong>Stanford University</strong></span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <span className="text-gray-500">🏠</span>
                                    <span className="text-gray-900">Lives in <strong>San Francisco</strong></span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <span className="text-gray-500">📍</span>
                                    <span className="text-gray-900">From <strong>New York</strong></span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <span className="text-gray-500">❤️</span>
                                    <span className="text-gray-900">Single</span>
                                </div>
                            </div>
                            
                            <button className="w-full mt-4 py-2 bg-gray-200 text-gray-900 text-sm font-semibold rounded-md hover:bg-gray-300">
                                Edit details
                            </button>
                        </div>
                        
                        {/* Photos */}
                        <div className="bg-white rounded-lg shadow p-4">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold">Photos</h2>
                                <a href="#" className="text-blue-600 text-sm hover:underline">See all photos</a>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                {[1,2,3,4,5,6,7,8,9].map(i => (
                                    <div key={i} className="aspect-square bg-gray-200 rounded-md"></div>
                                ))}
                            </div>
                        </div>
                        
                        {/* Friends */}
                        <div className="bg-white rounded-lg shadow p-4">
                            <div className="flex justify-between items-center mb-4">
                                <div>
                                    <h2 className="text-xl font-bold">Friends</h2>
                                    <p className="text-sm text-gray-600">1,234 friends</p>
                                </div>
                                <a href="#" className="text-blue-600 text-sm hover:underline">See all friends</a>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                {[1,2,3,4,5,6,7,8,9].map(i => (
                                    <div key={i}>
                                        <div className="aspect-square bg-gray-200 rounded-md mb-1"></div>
                                        <p className="text-xs font-semibold text-gray-900">Friend {i}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    
                    {/* Right Content */}
                    <div className="lg:col-span-3 space-y-4">
                        {/* Create Post */}
                        <div className="bg-white rounded-lg shadow p-4">
                            <div className="flex items-center gap-3 mb-3">
                                <img 
                                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150" 
                                    alt="Avatar" 
                                    className="w-10 h-10 rounded-full"
                                />
                                <button className="flex-1 text-left px-4 py-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200">
                                    What's on your mind, John?
                                </button>
                            </div>
                            <div className="border-t pt-3 flex justify-around">
                                <button className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-md text-gray-600">
                                    <span className="text-red-500">📹</span>
                                    <span className="text-sm font-semibold">Live video</span>
                                </button>
                                <button className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-md text-gray-600">
                                    <span className="text-green-500">🖼️</span>
                                    <span className="text-sm font-semibold">Photo/video</span>
                                </button>
                                <button className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-md text-gray-600">
                                    <span className="text-yellow-500">😊</span>
                                    <span className="text-sm font-semibold">Feeling/activity</span>
                                </button>
                            </div>
                        </div>
                        
                        {/* Posts Filter */}
                        <div className="bg-white rounded-lg shadow p-4">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-bold">Posts</h2>
                                <div className="flex gap-2">
                                    <button className="px-4 py-2 bg-gray-200 rounded-md text-sm font-semibold hover:bg-gray-300">
                                        Filters
                                    </button>
                                    <button className="px-4 py-2 bg-gray-200 rounded-md text-sm font-semibold hover:bg-gray-300">
                                        Manage posts
                                    </button>
                                </div>
                            </div>
                            <div className="flex gap-2 mt-3">
                                <button className="px-4 py-2 bg-blue-100 text-blue-600 rounded-md text-sm font-semibold">
                                    List view
                                </button>
                                <button className="px-4 py-2 bg-gray-100 text-gray-600 rounded-md text-sm font-semibold hover:bg-gray-200">
                                    Grid view
                                </button>
                            </div>
                        </div>
                        
                        {/* Sample Post */}
                        <div className="bg-white rounded-lg shadow p-4">
                            <div className="flex items-center gap-3 mb-3">
                                <img 
                                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150" 
                                    alt="Avatar" 
                                    className="w-10 h-10 rounded-full"
                                />
                                <div>
                                    <p className="font-semibold text-gray-900">John Doe</p>
                                    <p className="text-xs text-gray-500">2 hours ago · 🌍</p>
                                </div>
                            </div>
                            <p className="text-gray-900 mb-3">
                                Just finished an amazing project! 🚀 Feeling grateful for this incredible team.
                            </p>
                            <div className="h-96 bg-gray-200 rounded-md mb-3"></div>
                            <div className="flex justify-between text-sm text-gray-600 mb-3 pb-3 border-b">
                                <span>👍❤️😮 123</span>
                                <span>45 comments · 12 shares</span>
                            </div>
                            <div className="flex justify-around">
                                <button className="flex-1 py-2 hover:bg-gray-100 rounded-md text-gray-600 font-semibold text-sm">
                                    👍 Like
                                </button>
                                <button className="flex-1 py-2 hover:bg-gray-100 rounded-md text-gray-600 font-semibold text-sm">
                                    💬 Comment
                                </button>
                                <button className="flex-1 py-2 hover:bg-gray-100 rounded-md text-gray-600 font-semibold text-sm">
                                    ↗️ Share
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Profile;