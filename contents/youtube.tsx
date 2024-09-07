import { useEffect } from "react"

import { sendToBackground } from "~node_modules/@plasmohq/messaging"
import type {
  PlasmoCSConfig,
  PlasmoGetOverlayAnchor
} from "~node_modules/plasmo"

async function fetchSubtitles() {
  const urlParams = new URLSearchParams(window.location.search)
  const videoId = urlParams.get("v")

  console.log("Getting subtitles !!!! for video id " + videoId)

  const resp = await sendToBackground({
    name: "subtitles",
    extensionId: "lgefnccojheipphaoiiidlpbnpbikoji"
  })

  return resp;
}

const Subtitles = () => {
  useEffect(() => {
    fetchSubtitles().then((res) => console.log(res, "response"))
  }, [])
  return <div>Hello Patrick</div>
}

export const getOverlayAnchor: PlasmoGetOverlayAnchor = async () =>
  document.querySelector(youtubeControlBarSelector)

export const config: PlasmoCSConfig = {
  matches: ["*://www.youtube.com/*", "*://m.youtube.com/*"],
  world: "MAIN"
}

const youtubeControlBarSelector = ".ytp-caption-window-container"

export default Subtitles
