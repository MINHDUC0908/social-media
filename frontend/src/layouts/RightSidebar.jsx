import { Search } from "lucide-react";



function RightSidebar()
{
    const contacts = [
        { name: 'Lan Trần', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100', online: true },
        { name: 'Hùng Phạm', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100', online: true },
        { name: 'Mai Anh', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100', online: false }
    ];

    return (
        <>
            <aside className="hidden xl:block xl:col-span-3 space-y-4">
                <div className="sticky top-[85px] space-y-4">
                    <div className="bg-white shadow-sm border border-gray-200 p-4">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">ĐƯỢC TÀI TRỢ</h3>
                        <div className="flex gap-3">
                            <img 
                                src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=200" 
                                alt="Ad" 
                                className="w-20 h-20 rounded-lg object-cover"
                            />
                            <div>
                                <h4 className="text-sm font-semibold text-gray-900">MacBook Pro M3</h4>
                                <p className="text-xs text-gray-500">apple.com</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-semibold text-gray-700">LIÊN HỆ</h3>
                            <Search size={16} className="text-gray-400 cursor-pointer" />
                        </div>
                        <div className="space-y-3">
                            {contacts.map((contact, i) => (
                                <div key={i} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition">
                                    <div className="relative">
                                        <img 
                                            src={contact.avatar} 
                                            alt={contact.name} 
                                            className="w-9 h-9 rounded-full"
                                        />
                                        {contact.online && (
                                            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></div>
                                        )}
                                    </div>
                                    <span className="text-sm text-gray-800">{contact.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </aside>
        </>
    )
}

export default RightSidebar