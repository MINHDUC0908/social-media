import { Home, Users, Grid, MessageCircle, Bell, Search } from 'lucide-react';
import src from '../api/src';


const Header = ({ currentPage, profile, totalUnread }) => {
    return (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-4 lg:gap-8">
                    <h1 className="text-xl sm:text-2xl font-bold text-indigo-600">VibeConnect</h1>
                    
                    <div className="relative hidden md:block">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Tìm kiếm..." 
                            className="w-60 lg:w-96 pl-10 pr-4 py-2 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        />
                    </div>
                </div>

                <nav className="flex items-center gap-4 sm:gap-6 lg:gap-8">
                    <a href="#home" className={`${currentPage === 'home' ? 'text-indigo-600' : 'text-gray-500'} hover:text-indigo-600 transition`}>
                        <Home size={24} strokeWidth={currentPage === 'home' ? 2.5 : 2} />
                    </a>
                    <a href="#friends" className={`${currentPage === 'friends' ? 'text-indigo-600' : 'text-gray-500'} hover:text-indigo-600 transition`}>
                        <Users size={24} strokeWidth={currentPage === 'friends' ? 2.5 : 2} />
                    </a>
                    <a href="#groups" className={`${currentPage === 'groups' ? 'text-indigo-600' : 'text-gray-500'} hover:text-indigo-600 transition hidden sm:block`}>
                        <Grid size={24} strokeWidth={currentPage === 'groups' ? 2.5 : 2} />
                    </a>
                    <a
                        href="#messages"
                        className={`${currentPage === 'messages' ? 'text-indigo-600' : 'text-gray-500'} hover:text-indigo-600 transition relative`}
                    >
                        <MessageCircle size={24} strokeWidth={currentPage === 'messages' ? 2.5 : 2} />

                        {totalUnread > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] px-[5px] py-[1px] rounded-full">
                                {totalUnread}
                            </span>
                        )}
                    </a>
                    <a href="#notifications" className={`${currentPage === 'notifications' ? 'text-indigo-600' : 'text-gray-500'} hover:text-indigo-600 transition`}>
                        <Bell size={24} strokeWidth={currentPage === 'notifications' ? 2.5 : 2} />
                    </a>
                    <a href="#profile">
                        <img 
                            src={src + profile?.image_url} 
                            alt="Avatar" 
                            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full cursor-pointer border-2 border-indigo-500 object-cover"
                        />
                    </a>
                </nav>
            </div>
        </header>
    );
};

export default Header;
