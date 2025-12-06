

function Notification()
{
    return (
        <div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Thông báo</h2>
                <div className="space-y-3">
                    {[
                        { user: 'Lan Trần', action: 'đã thích bài viết của bạn', time: '5 phút trước', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100', unread: true },
                        { user: 'Hùng Phạm', action: 'đã bình luận về bài viết của bạn', time: '1 giờ trước', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100', unread: true },
                        { user: 'Mai Anh', action: 'đã gửi lời mời kết bạn', time: '3 giờ trước', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100', unread: false }
                    ].map((notif, i) => (
                        <div key={i} className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition ${notif.unread ? 'bg-blue-50 hover:bg-blue-100' : 'hover:bg-gray-50'}`}>
                            <img src={notif.avatar} alt={notif.user} className="w-10 h-10 sm:w-12 sm:h-12 rounded-full" />
                            <div className="flex-1">
                                <p className="text-sm text-gray-800">
                                    <span className="font-semibold">{notif.user}</span> {notif.action}
                                </p>
                                <p className="text-xs text-indigo-600">{notif.time}</p>
                            </div>
                            {notif.unread && (
                                <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Notification;