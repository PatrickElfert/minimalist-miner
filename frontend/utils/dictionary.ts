import axios from "axios";
import type {JMdict} from "@scriptin/jmdict-simplified-types";


export async function getDictionaryEntry(searchTerm: string) {
  const response = await axios.get(
    chrome.runtime.getURL("assets/jmdict-eng-3.5.0.json")
  )
  const dictionary = response.data as JMdict

  return dictionary.words.find((word) =>
    word.kanji.find((kanji) => kanji.text === searchTerm)
  )
}
