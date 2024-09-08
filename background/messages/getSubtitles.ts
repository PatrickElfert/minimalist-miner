import type { PlasmoMessaging } from "@plasmohq/messaging"

import { getJapaneseLanguage, getSubtitles } from "~utils/fetch-subtitles"
import { initializeModel, tokenizeSentence } from "~utils/parse-subtitles"
import { JaPosTags } from "~utils/tags"

export interface Subtitle {
  tokens: string[]
  start: number
  end: number
}

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  const [jp, model] = await Promise.all([
    getJapaneseLanguage(req.body.videoId),
    initializeModel()
  ])
  const subs = await getSubtitles(jp)

  const subtitles = subs.map((subtitle) => ({
    tokens: tokenizeSentence(
      subtitle.text,
      Object.values(JaPosTags),
      model
    ).map((token) => token.value[0]),
    start: Number(subtitle.start),
    end: Number(subtitle.dur) + Number(subtitle.start)
  }))

  res.send({
    subtitles
  })
}

export default handler
