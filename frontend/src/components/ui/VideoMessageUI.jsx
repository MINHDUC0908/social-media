import React, { useState, useRef } from 'react';
import {
    Play,
    Volume2,
    VolumeX,
    Maximize2,
    Minimize2,
    Loader2,
} from 'lucide-react';

const VideoMessageUI = ({ msg, onDelete }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [hover, setHover] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const videoRef = useRef(null);

    const togglePlay = () => {
        const video = videoRef.current;
        if (!video) return;
        if (video.paused) {
            video.play();
            setIsPlaying(true);
        } else {
            video.pause();
            setIsPlaying(false);
        }
    };

    const toggleMute = () => {
        const video = videoRef.current;
        if (video) {
            video.muted = !video.muted;
            setIsMuted(video.muted);
        }
    };

    const toggleFullscreen = () => {
        const container = videoRef.current.parentElement;
        if (!document.fullscreenElement) {
            container.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    const handleDownload = () => {
        const link = document.createElement("a");
        link.href = msg.video_url;
        link.download = msg.video_name || "video.mp4";
        link.click();
        setShowMenu(false);
    };

    const handleCopyLink = async () => {
        await navigator.clipboard.writeText(msg.video_url);
        alert("Đã sao chép link video!");
        setShowMenu(false);
    };

    const handleDelete = () => {
        if (onDelete) onDelete(msg.id);
        setShowMenu(false);
    };

    return (
       <div className="flex items-start justify-start">
            <div className="w-fit">
                <div className="bg-white overflow-hidden shadow rounded-xl">
                    <div
                        className="relative bg-black flex items-center justify-center group"
                        style={{
                            width: "140px",
                            height: "140px",
                        }}
                        onMouseEnter={() => setHover(true)}
                        onMouseLeave={() => setHover(false)}
                    >
                        <video
                            ref={videoRef}
                            src={msg.video_url}
                            className="max-w-full max-h-full object-contain"
                            muted={isMuted}
                            preload="metadata"
                            onPlay={() => setIsPlaying(true)}
                            onPause={() => setIsPlaying(false)}
                        />

                        {/* ---- Loading Overlay ---- */}
                        {msg.isUploading && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60">
                                <Loader2 className="w-8 h-8 text-white animate-spin mb-1" />
                                <p className="text-white text-xs">Đang tải lên...</p>
                            </div>
                        )}

                        {/* ---- Play Button (Nhỏ) ---- */}
                        {!msg.isUploading && !isPlaying && (
                            <button
                                onClick={togglePlay}
                                className={`absolute w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow transition-all duration-300 ${
                                    hover ? "opacity-100 scale-100" : "opacity-0 scale-90"
                                }`}
                            >
                                <Play className="w-6 h-6 text-gray-800 ml-1" fill="currentColor" />
                            </button>
                        )}

                        {/* ---- SMALL CONTROLS (COMPRESSED) ---- */}
                        {!msg.isUploading && (
                            <div
                                className={`absolute bottom-0 left-0 right-0 bg-black/50 h-8 flex items-center justify-between px-2 backdrop-blur-sm transition-all duration-300 ${
                                    hover ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
                                }`}
                            >
                                {/* Play + Mute */}
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={togglePlay}
                                        className="text-white hover:text-gray-300"
                                    >
                                        {isPlaying ? (
                                            <span className="text-lg">❚❚</span>
                                        ) : (
                                            <Play className="w-4 h-4" fill="white" />
                                        )}
                                    </button>

                                    <button
                                        onClick={toggleMute}
                                        className="text-white hover:text-gray-300"
                                    >
                                        {isMuted ? (
                                            <VolumeX className="w-4 h-4" />
                                        ) : (
                                            <Volume2 className="w-4 h-4" />
                                        )}
                                    </button>
                                </div>

                                {/* Fullscreen */}
                                <button
                                    onClick={toggleFullscreen}
                                    className="text-white hover:text-gray-300"
                                >
                                    {isFullscreen ? (
                                        <Minimize2 className="w-4 h-4" />
                                    ) : (
                                        <Maximize2 className="w-4 h-4" />
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>

    );
};

export default VideoMessageUI;
