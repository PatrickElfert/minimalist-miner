import type { PlasmoMessaging } from "@plasmohq/messaging"

import { getJapaneseLanguage, getSubtitles } from "~utils/fetch-subtitles"
import { initializeModel, tokenizeSentence } from "~utils/parse-subtitles"
import { JaPosTags } from "~utils/tags"
import {getDictionaryEntry} from "~utils/dictionary";

export interface Subtitle {
  tokens: string[]
  start: number
  end: number
}

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  const word = req.body.word;
  const jmDictWord= await getDictionaryEntry(word);

  res.send({
    jmDictWord
  })
}

export default handler
