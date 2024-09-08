import type { JMdict } from "~node_modules/@scriptin/jmdict-simplified-types"
import axios from "~node_modules/axios"

export async function getDictionaryEntry(searchTerm: string) {
  const response = await axios.get(
    chrome.runtime.getURL("assets/jmdict-eng-3.5.0.json")
  )
  const dictionary = response.data as JMdict

  return dictionary.words.find((word) =>
    word.kanji.find((kanji) => kanji.text === searchTerm)
  )
}
