import React, { ChangeEvent, useState } from "react"

import "style.css"

function Player() {
  const [videoSrc, setVideoSrc] = useState<string | null>(null)
  const [subtitleSrc, setSubtitleSrc] = useState<string | null>(null)

  const fileSelected = (
    e: ChangeEvent<HTMLInputElement>,
    onFileSelected: (fileUrl: string) => void
  ) => {
    const file = e.target.files?.[0]
    if (file) {
      const fileURL = URL.createObjectURL(file)
      onFileSelected(fileURL)
    }
  }

  const handleVideoFileSelected = (e: ChangeEvent<HTMLInputElement>) => {
    fileSelected(e, (fileUrl) => setVideoSrc(fileUrl))
  }

  const handleSubtitleFileSelected = (e: ChangeEvent<HTMLInputElement>) => {
    fileSelected(e, (subtitleSrc) => setSubtitleSrc(subtitleSrc))
  }

  return (
      <div className={"flex flex-col"}>
          <input
              className={"py-2"}
              type="file"
              accept="video/*"
              onChange={handleVideoFileSelected}
          />
          <input
              className={"py-2"}
              type="file"
              accept=".srt"
              onChange={handleSubtitleFileSelected}
          />
          {videoSrc && (
              <video className={"h-full w-full"} controls>
                  <source src={videoSrc} type="video/mp4"/>
                  Your browser does not support the video tag.
              </video>
          )}
      </div>
  )
}

export default Player
