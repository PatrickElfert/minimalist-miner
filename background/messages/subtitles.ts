import type { PlasmoMessaging } from "@plasmohq/messaging"
import axios from "~node_modules/axios";
import striptags from "~node_modules/striptags";
import he from "he";

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  const jp = await getJapaneseLanguage(req.body.videoId);
  const subtitles = await getSubtitles(jp);

  res.send({
    subtitles
  })
}

export default handler


function extractCaptions(html) {
  const splittedHtml = html.split('"captions":')

  console.log(splittedHtml);

  if (splittedHtml.length > 1) {
    const videoDetails = splittedHtml[1].split(',"videoDetails')[0]
    console.log(videoDetails)
    const jsonObj = JSON.parse(videoDetails.replace('\n', ''))
    console.log(jsonObj);
    return jsonObj['playerCaptionsTracklistRenderer']
  }
  return null
}

async function getJapaneseLanguage(videoID) {
  const videoURL = `https://www.youtube.com/watch?v=${videoID}`
  const { data } = await axios.get(videoURL)
  const decodedData = data.replace('\\u0026', '&').replace('\\', '')

  console.log(decodedData);

  const captionJSON = extractCaptions(decodedData)

  return captionJSON.captionTracks.map(track => {
    return {
      ...track,
      language: track.name.simpleText,
    }
  }).find(track => track.languageCode === 'ja');
}

async function getSubtitles(subtitle) {
    if (!subtitle || !subtitle.baseUrl) {
        throw new Error(`Subtitle object received is not valid`)
    }

    const { data: transcript } = await axios.get(subtitle.baseUrl)

    const lines = transcript
        .replace('<?xml version="1.0" encoding="utf-8" ?><transcript>', '')
        .replace('</transcript>', '')
        .split('</text>')
        .filter(line => line && line.trim())
        .map(line => {
            const startRegex = /start="([\d.]+)"/
            const durRegex = /dur="([\d.]+)"/

            const [, start] = startRegex.exec(line)
            const [, dur] = (durRegex.exec(line) || [, 0.0])

            const htmlText = line
                .replace(/<text.+>/, '')
                .replace(/&amp;/gi, '&')
                .replace(/<\/?[^>]+(>|$)/g, '')

            const decodedText = he.decode(htmlText)
            const text = striptags(decodedText)

            return {
                start,
                dur,
                text,
            }
        })

    return lines
}
