export default function ChatLoading() {
    return (
        <div className="w-full h-full flex items-center justify-center bg-white/70">
            <div className="flex flex-col items-center gap-2">

                {/* vòng xoay */}
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>

                <span className="text-sm text-gray-500">Đang tải tin nhắn...</span>
            </div>
        </div>
    );
}
