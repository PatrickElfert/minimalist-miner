import { useEffect, useState } from "react"

import type { Subtitle } from "~background"
import {sendToBackground} from "@plasmohq/messaging";
import type {PlasmoCSConfig, PlasmoGetInlineAnchor, PlasmoGetStyle} from "plasmo";
import type {JMdictWord} from "@scriptin/jmdict-simplified-types";

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
    name: "getSubtitles",
    body: {
      videoId
    },
    extensionId: "okmifickmdldchafgpgokegifonnhedm"
  })

  return resp.subtitles as Subtitle[]
}

async function queryDictionary(word: string) {
  const resp = await sendToBackground({
    name: "queryDictionary",
    body: {
      word
    },
    extensionId: "okmifickmdldchafgpgokegifonnhedm"
  })

  return resp.jmDictWord as JMdictWord;
}

const Subtitles = () => {
  const urlParams = new URLSearchParams(window.location.search)
  const videoId = urlParams.get("v")
  const [subtitles, setSubtitles] = useState<Subtitle[]>([])
  const [currentSubtitleTokens, setCurrentSubtitleTokens] = useState<string[]>(
    []
  )

  const [currentDictionaryEntry, setCurrentDictionaryEntry] = useState<string | null>(null);

  const updateSubtitlesOnVideoProgress = (video: HTMLVideoElement) => {
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
  }

  const onShiftHoverWord = (word: string) => {
    console.log(word)
    queryDictionary(word).then((jmDictWord) => {
      console.log(jmDictWord);
    });
  }

  useEffect(() => {
    fetchSubtitles(videoId).then((subtitles) => {
      setSubtitles(subtitles)
    })
  }, [videoId])

  useEffect(() => {
    if (subtitles.length > 0) {
      const video = document.querySelector("video")
      updateSubtitlesOnVideoProgress(video)
    }
  }, [subtitles])

  return (
    <div
      style={{
        fontSize: "28px",
        background: "black",
        opacity: 0.5,
        bottom: 0,
        display: "flex"
      }}>
      {currentSubtitleTokens.map((token) => (
        <div style={{
          zIndex: 99999
        }} onClick={() => onShiftHoverWord(token)}>{token}</div>
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

export default Subtitles
