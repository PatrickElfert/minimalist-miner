import { useEffect, useState } from "react"

import { sendToBackground } from "~node_modules/@plasmohq/messaging"
import type {
  PlasmoCSConfig,
  PlasmoGetInlineAnchor,
  PlasmoGetStyle
} from "~node_modules/plasmo"

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

async function fetchSubtitles(videoId: string) {
  const resp = await sendToBackground({
    name: "subtitles",
    body: {
      videoId
    },
    extensionId: "lgefnccojheipphaoiiidlpbnpbikoji"
  })

  return resp
}

const Subtitles = () => {
  const urlParams = new URLSearchParams(window.location.search)
  const videoId = urlParams.get("v")
  const [subtitles, setSubtitles] = useState<
    { start: string; dur: string; text: string }[]
  >([])
  const [currentSubtitleText, setCurrentSubtitleText] = useState<string>("")

  const updateSubtitlesOnVideoProgress = (video: HTMLVideoElement) => {
    video.addEventListener("timeupdate", () => {
      const currentSubtitle = subtitles.find((subtitle) => {
        const subtitleStart = Number(subtitle.start)
        const subtitleEnd = Number(subtitle.dur) + subtitleStart

        return (
          video.currentTime > subtitleStart && video.currentTime < subtitleEnd
        )
      })

      if (currentSubtitle?.text) {
        setCurrentSubtitleText(currentSubtitle.text)
      }
    })
  }

  useEffect(() => {
    fetchSubtitles(videoId).then((res) => {
      setSubtitles(res.subtitles)
    })
  }, [videoId])

  useEffect(() => {
    const video = document.querySelector("video")
    updateSubtitlesOnVideoProgress(video);
  }, [subtitles]);

  return (
    <div
      style={{
        fontSize: "28px",
        background: "black",
        opacity: 0.5,
        bottom: 0
      }}>
      {currentSubtitleText}
    </div>
  )
}

export const getInlineAnchor: PlasmoGetInlineAnchor = async () =>
  document.querySelector(youtubeControlBarSelector)

export const config: PlasmoCSConfig = {
  matches: ["*://www.youtube.com/*", "*://m.youtube.com/*"]
}

const youtubeControlBarSelector = ".ytp-chrome-controls"

export default Subtitles
