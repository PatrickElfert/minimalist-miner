import React, { useState, ChangeEvent } from 'react';

const VideoPlayer = () => {
    const [videoSrc, setVideoSrc] = useState<string | null>(null);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const fileURL = URL.createObjectURL(file);
            setVideoSrc(fileURL);
        }
    };

    return (
        <div>
            <input
                type="file"
                accept="video/*"
                onChange={handleFileChange}
            />
            {videoSrc && (
                <video width="600" controls>
                    <source src={videoSrc} type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
            )}
        </div>
    );
};

export default VideoPlayer;
