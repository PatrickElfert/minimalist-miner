import { useEffect, useState } from "react"
import { useTimer } from "react-use-precision-timer"

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

function addClickListener(onClick: () => void, selector: string) {
  const button = document.querySelector(selector) // Use any selector you need

  if (button) {
    button.addEventListener("click", function () {
      onClick()
    })
  } else {
    console.log("Button not found")
  }
}

const Subtitles = () => {
  const urlParams = new URLSearchParams(window.location.search)
  const videoId = urlParams.get("v")
  const [subtitles, setSubtitles] = useState<
    { start: string; dur: string; text: string }[]
  >([])
  const [currentSubtitleText, setCurrentSubtitleText] = useState<string>("")

  const timer = useTimer({ delay: 1000, startImmediately: false }, (time) => {
    const elapsedTime = timer.getElapsedRunningTime() / 1000

    const currentSubtitle = subtitles.find((s) => {
      const subtitleStart = Number(s.start)
      const subtitleEnd = Number(s.dur) + subtitleStart

      return subtitleStart >= elapsedTime && elapsedTime < subtitleEnd
    })

    setCurrentSubtitleText(currentSubtitle.text)
  })

  useEffect(() => {
    fetchSubtitles(videoId).then((res) => setSubtitles(res.subtitles))
    addClickListener(() => {
      if (!timer.isStarted()) {
        console.log("Starting timer")
        timer.start()
      } else if (timer.isRunning()) {
        console.log("Pausing timer")
        timer.pause()
      } else {
        console.log("Resuming timer")
        timer.resume()
      }
    }, ".ytp-play-button")
  }, [videoId])

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
