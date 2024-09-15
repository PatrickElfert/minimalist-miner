import {
  QueryClient,
  QueryClientProvider,
  useQuery
} from "@tanstack/react-query"
import type {
  PlasmoCSConfig,
  PlasmoGetInlineAnchor,
  PlasmoGetStyle
} from "plasmo"
import { useEffect, useState } from "react"

import { client, SubtitleResponseDto } from "~api"
import {
  appControllerGetSubtitlesOptions,
  appControllerGetTokenizedSubtitleOptions,
  appControllerGetTokenizedSubtitlesOptions
} from "~api/@tanstack/react-query.gen"

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

const Wrapper = () => (
  <QueryClientProvider client={queryClient}>
    <Subtitles></Subtitles>
  </QueryClientProvider>
)

const Subtitles = () => {
  client.setConfig({
    baseUrl: "http://localhost:3000"
  })

  const urlParams = new URLSearchParams(window.location.search)
  const videoId = urlParams.get("v")
  const [currentSubtitle, setCurrentSubtitle] =
    useState<SubtitleResponseDto | null>(null)

  const { data: subtitles } = useQuery(
    appControllerGetSubtitlesOptions({ path: { id: videoId } })
  )

  const { data: tokens} = useQuery({
    ...appControllerGetTokenizedSubtitleOptions({
      body: {
        text: currentSubtitle?.text,
        end: currentSubtitle?.end,
        start: currentSubtitle?.start
      }
    }),
    enabled: !!currentSubtitle
  } as any)

  const updateSubtitlesOnVideoProgress = (video: HTMLVideoElement) => {
    video.addEventListener("timeupdate", () => {
      if (subtitles?.length > 0) {
        const nextSubtitle = subtitles.find((subtitle) => {
          return (
            video.currentTime > subtitle.start &&
            video.currentTime < subtitle.end
          )
        })
        if (nextSubtitle.text !== currentSubtitle!.text) {
          setCurrentSubtitle(nextSubtitle)
        }
      }
    })
  }

  useEffect(() => {
    const video = document.querySelector("video")
    updateSubtitlesOnVideoProgress(video)
  }, [])

  const onShiftHoverWord = (word: string) => {}

  return (
    <div
      style={{
        fontSize: "28px",
        background: "black",
        opacity: 0.5,
        bottom: 0,
        display: "flex"
      }}>
      {tokens?.map((token) => (
        <div
          style={{
            zIndex: 99999
          }}
          onClick={() => onShiftHoverWord(token)}>
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

export default Wrapper
