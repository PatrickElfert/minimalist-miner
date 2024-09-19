import { useEffect, useState } from "react"

import type { TokenizedSubtitleResponseDto } from "~api/apiSchemas"

export const usePlaybackSubtitle = (
  subtitles: TokenizedSubtitleResponseDto[]
) => {
  const [currentSubtitle, setCurrentSubtitle] =
    useState<TokenizedSubtitleResponseDto>()

  const updateSubtitlesOnVideoProgress = (video: HTMLVideoElement) => {
    const handleTimeUpdate = () => {
      const matchingSubtitle = subtitles.find((subtitle) => {
        return (
          video.currentTime >= subtitle.start &&
          video.currentTime <= subtitle.end
        )
      })

      if (matchingSubtitle && matchingSubtitle !== currentSubtitle) {
        setCurrentSubtitle(matchingSubtitle)
      }
    }

    video.addEventListener("timeupdate", handleTimeUpdate)

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate)
    }
  }

  useEffect(() => {
    if (subtitles.length > 0) {
      const video = document.querySelector("video") as HTMLVideoElement
      if (video) {
        const cleanup = updateSubtitlesOnVideoProgress(video)
        return cleanup
      }
    }
  }, [subtitles])

  return currentSubtitle
}
