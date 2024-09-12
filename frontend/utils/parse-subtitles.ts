import { JaPosTags } from './tags';
import axios from "axios";
var RakutenMA = require('rakutenma');

export async function initializeModel() {
  const response = await axios.get(chrome.runtime.getURL('assets/model_ja.json'));
  const rma = new RakutenMA(response.data, 1024, 0.007812);
  rma.featset = RakutenMA.default_featset_ja;
  rma.hash_func = RakutenMA.create_hash_func(15);
  return rma;
}

export function tokenizeSentence(sentence: string, withTags: JaPosTags[], model: any) {
  const tokens = model.tokenize(sentence) as [string, JaPosTags][];
  return tokens
      .filter((token) => withTags.includes(token[1]))
      .map((token) => new Token(token));
}

export class Token {
  constructor(value: [string, JaPosTags]) {
    this.value = value;
  }

  value: [string, JaPosTags];

  isEqual(token: Token) {
    return this.value[0] === token.value[0] && this.value[1] === this.value[1];
  }
}
