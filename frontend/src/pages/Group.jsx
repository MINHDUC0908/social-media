
function Group()
{
    return (
        <div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Nhóm của bạn</h2>
                <div className="space-y-4">
                    {[
                        { name: 'Cộng đồng Developers Việt Nam', members: '12.5K', image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=200' },
                        { name: 'Du lịch Đà Nẵng', members: '8.3K', image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=200' },
                        { name: 'Ẩm thực Việt Nam', members: '15.2K', image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=200' }
                    ].map((group, i) => (
                        <div key={i} className="flex gap-4 border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                            <img src={group.image} alt={group.name} className="w-20 h-20 rounded-lg object-cover" />
                            <div className="flex-1">
                                <h4 className="font-semibold text-gray-900">{group.name}</h4>
                                <p className="text-sm text-gray-500">{group.members} thành viên</p>
                                <button className="mt-2 px-4 py-1 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 transition">
                                    Xem nhóm
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Group;