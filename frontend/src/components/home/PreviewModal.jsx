import { ArrowLeft, ArrowRight, X } from "lucide-react";

function PreviewModal({ 
    isOpen, 
    onClose, 
    previewMediaList, 
    currentPreviewIndex, 
    handlePrev, 
    handleNext,
    src 
}) {
    if (!isOpen) return null;
    const media = previewMediaList[currentPreviewIndex];
    const isVideo = media && media.media_type.startsWith("video");
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <button 
                onClick={onClose} 
                className="absolute top-4 right-4 text-white hover:text-gray-300 transition z-50"
            >
                <X size={28} />
            </button>
            <button 
                onClick={handlePrev}
                className="absolute left-4 text-white hover:text-gray-300 transition z-50"
            >
                <ArrowLeft size={36} />
            </button>
            <div className="bg-black rounded-lg max-w-[90vw] max-h-[80vh] flex items-center justify-center overflow-hidden relative">
                {isVideo ? (
                    <video 
                        src={src + media.media_url} 
                        controls 
                        className="max-w-full max-h-[80vh] object-contain rounded-lg"
                    />
                ) : (
                    <img 
                        src={src + media.media_url} 
                        alt="preview" 
                        className="max-w-full max-h-[80vh] object-contain rounded-lg"
                    />
                )}
            </div>
            <button 
                onClick={handleNext}
                className="absolute right-4 text-white hover:text-gray-300 transition z-50"
            >
                <ArrowRight size={36} />
            </button>
        </div>
    );
}

export default PreviewModal