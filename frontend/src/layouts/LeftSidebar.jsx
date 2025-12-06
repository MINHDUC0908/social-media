import { Users, Bookmark, Clock, Grid, Store } from 'lucide-react';
import src from '../api/src';


const LeftSidebar = ({ currentPage, profile, navigateTo }) => {
    return (
        <aside className="hidden lg:block lg:col-span-3">
            <div className="bg-white shadow-sm border border-gray-200 p-4 space-y-2 sticky top-[85px]">
                <button 
                    onClick={() => navigateTo('profile')}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition ${currentPage === 'profile' ? 'bg-gray-100' : ''}`}
                >
                    <img 
                        src={profile?.image_url == null ? "https://cdn-icons-png.flaticon.com/512/4825/4825038.png" : src + profile?.image_url}
                        alt="Avatar" 
                        className="w-9 h-9 rounded-full border-2 border-gray-300 cursor-pointer object-cover"
                    />
                    <span className="text-gray-800 font-medium">{profile?.name}</span>
                </button>
                
                <button 
                    onClick={() => navigateTo('stories')}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition ${currentPage === 'stories' ? 'bg-gray-100' : ''}`}
                >
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                        <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center">
                            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-500"></div>
                        </div>
                    </div>
                    <span className="text-gray-800">Story</span>
                </button>
                
                <button 
                    onClick={() => navigateTo('friends')}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition ${currentPage === 'friends' ? 'bg-gray-100' : ''}`}
                >
                    <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center">
                        <Users size={20} className="text-white" />
                    </div>
                    <span className="text-gray-800">Bạn bè</span>
                </button>
                
                <button 
                    onClick={() => navigateTo('saved')}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition ${currentPage === 'saved' ? 'bg-gray-100' : ''}`}
                >
                    <div className="w-9 h-9 rounded-full bg-purple-500 flex items-center justify-center">
                        <Bookmark size={20} className="text-white" />
                    </div>
                    <span className="text-gray-800">Đã lưu</span>
                </button>
                
                <button 
                    onClick={() => navigateTo('memories')}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition ${currentPage === 'memories' ? 'bg-gray-100' : ''}`}
                >
                    <div className="w-9 h-9 rounded-full bg-blue-400 flex items-center justify-center">
                        <Clock size={20} className="text-white" />
                    </div>
                    <span className="text-gray-800">Kỷ niệm</span>
                </button>
                
                <button 
                    onClick={() => navigateTo('groups')}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition ${currentPage === 'groups' ? 'bg-gray-100' : ''}`}
                >
                    <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center">
                        <Grid size={20} className="text-white" />
                    </div>
                    <span className="text-gray-800">Nhóm</span>
                </button>
                
                <button 
                    onClick={() => navigateTo('marketplace')}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition ${currentPage === 'marketplace' ? 'bg-gray-100' : ''}`}
                >
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-red-400 to-pink-400 flex items-center justify-center">
                        <Store size={20} className="text-white" />
                    </div>
                    <span className="text-gray-800">Marketplace</span>
                </button>
                
                <button 
                    onClick={() => navigateTo('watch')}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition ${currentPage === 'watch' ? 'bg-gray-100' : ''}`}
                >
                    <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                            <path d="M8 5v14l11-7z"/>
                        </svg>
                    </div>
                    <span className="text-gray-800">Video</span>
                </button>
            </div>
        </aside>
    );
};

export default LeftSidebar;
