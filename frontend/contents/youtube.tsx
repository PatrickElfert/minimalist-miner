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

import { appControllerGetTokenizedSubtitlesOptions } from "~api/@tanstack/react-query.gen"
import {client} from "~api";

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
    baseUrl: "http://localhost:3000",
  })

  const urlParams = new URLSearchParams(window.location.search)
  const videoId = urlParams.get("v")

  console.log("loading")

  const { data } = useQuery(
    appControllerGetTokenizedSubtitlesOptions({ path: { id: videoId } })
  )

  console.log(data)

  /** const updateSubtitlesOnVideoProgress = (video: HTMLVideoElement) => {
    video.addEventListener("timeupdate", () => {
      const currentSubtitle = subtitles.find((subtitle) => {
        return (
          video.currentTime > subtitle.start && video.currentTime < subtitle.end
        )
      })

      if (currentSubtitle?.tokens) {
        setCurrentSubtitleTokens(currentSubtitle.tokens)
      }
    })
  }**/

  const onShiftHoverWord = (word: string) => {}

  /** useEffect(() => {
    if (subtitles.length > 0) {
      const video = document.querySelector("video")
      updateSubtitlesOnVideoProgress(video)
    }
  }, [subtitles]) **/

  return (
    <div
      style={{
        fontSize: "28px",
        background: "black",
        opacity: 0.5,
        bottom: 0,
        display: "flex"
      }}>
      {[].map((token) => (
        <div
          style={{
            zIndex: 99999
          }}
          onClick={() => onShiftHoverWord(token)}>
          {token}
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
