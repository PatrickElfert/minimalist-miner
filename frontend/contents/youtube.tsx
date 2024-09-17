import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import type {
  PlasmoCSConfig,
  PlasmoGetInlineAnchor,
  PlasmoGetStyle
} from "plasmo"
import { useEffect, useState } from "react"

import {
  useAppControllerGetSubtitles,
  useAppControllerGetTokenizedSubtitle
} from "~api/apiComponents"
import type { SubtitleResponseDto } from "~api/apiSchemas"

const style = document.createElement("style")
style.textContent = `
  plasmo-csui {
    position: absolute !important;
    top: -50px !important;
    width: 100%;
  } 
  /* Add more styles here */
`
document.head.appendChild(style)

export const getStyle: PlasmoGetStyle = () => {
  const style = document.createElement("style")
  style.textContent = `
    #plasmo-shadow-container {
      display: flex !important;
      justify-content: center !important;
    }
  `
  return style
}

const queryClient = new QueryClient()

const Container = () => (
  <QueryClientProvider client={queryClient}>
    <Subtitles></Subtitles>
  </QueryClientProvider>
)

const Subtitles = () => {
  const urlParams = new URLSearchParams(window.location.search)
  const videoId = urlParams.get("v")
  const [currentSubtitle, setCurrentSubtitle] =
    useState<SubtitleResponseDto | null>(null)

  const { data: subtitles } = useAppControllerGetSubtitles({
    pathParams: { id: videoId }
  })

  const updateSubtitlesOnVideoProgress = (video: HTMLVideoElement) => {
    video.addEventListener("timeupdate", () => {
      const nextSubtitle = subtitles.find((subtitle) => {
        return (
          video.currentTime > subtitle.start && video.currentTime < subtitle.end
        )
      })
      if (nextSubtitle.text !== currentSubtitle?.text) {
        setCurrentSubtitle(nextSubtitle)
      }
    })
  }

  useEffect(() => {
    if (subtitles && subtitles.length > 0) {
      const video = document.querySelector("video")
      updateSubtitlesOnVideoProgress(video)
    }
  }, [subtitles])

  if (currentSubtitle?.text) {
    return <SubtitleLine subtitle={currentSubtitle.text} />
  } else {
    return null
  }
}

export const SubtitleLine = (props: { subtitle: string }) => {
    console.log('subtitle changed', props.subtitle)
  const { data } = useAppControllerGetTokenizedSubtitle({
    queryParams: {
      text: props.subtitle
    }
  })

  return (
    <div
      style={{
        fontSize: "28px",
        background: "black",
        opacity: 0.5,
        bottom: 0,
        display: "flex"
      }}>
      {data?.tokens?.map((token) => (
        <div
          style={{
            zIndex: 99999
          }}>
          {token?.text}
        </div>
      ))}
    </div>
  )
}

export const getInlineAnchor: PlasmoGetInlineAnchor = async () =>
  document.querySelector(youtubeControlBarSelector)

export const config: PlasmoCSConfig = {
  matches: ["*://www.youtube.com/*", "*://m.youtube.com/*"]
}

const youtubeControlBarSelector = ".ytp-chrome-controls"

export default Container
