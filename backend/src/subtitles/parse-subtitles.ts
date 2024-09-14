import {exec} from 'child_process';

export type Token = {
  readonly reading?: string;
  readonly text: string;
  readonly kana?: string;
  readonly score?: number;
  readonly seq?: number;
  readonly gloss?: Gloss[];
  readonly conj?: Conj[];
  readonly compound?: string[];
  readonly components?: Component[];
};

export type Component = {
  readonly reading: string;
  readonly text: string;
  readonly kana: string;
  readonly score: number;
  readonly seq: number;
  readonly conj: Conj[];
  readonly suffix?: string;
};

export type Conj = {
  readonly prop: Prop[];
  readonly reading: string;
  readonly gloss: Gloss[];
  readonly readok: boolean;
};

export type Gloss = {
  readonly pos: string;
  readonly gloss: string;
  readonly info?: string;
};

export type Prop = {
  readonly pos: string;
  readonly type: string;
};

type NestedArr = Array<string | Token | number | NestedArr>;

const isNumber = (val: any) => typeof val === 'number' && val === val;

export async function tokenizeSentence(sentence: string) {
  const result = await execInContainer(
    'ichiran-main-1',
    `ichiran-cli -f ${sentence}`,
  );

  return await formatTokens(result);
}

async function formatTokens(cmdOutput: string): Promise<Token[]> {
  const result = JSON.parse(cmdOutput);
  const parsed = parseTokens(result);
  return parsed;
}

//@Todo parse strings like comma correctly
function parseTokens(elements: NestedArr): Token[] {
  const tokens: Token[] = [];

  function recursiveParse(elements: NestedArr) {
    for (const element of elements) {
      if (Array.isArray(element)) {
        recursiveParse(element as NestedArr);
      } else if (typeof element === 'string') {
        continue;
      } else if (isNumber(element)) {
        continue;
      } else {
        tokens.push(element as Token);
      }
    }
  }

  recursiveParse(elements);
  return tokens;
}

async function execInContainer(containerName, command): Promise<string> {
  return new Promise((resolve, reject) => {
    exec(`docker exec ${containerName} ${command}`, (error, stdout, stderr) => {
      if (error) {
        reject(`Error executing command: ${error.message}`);
        return;
      }
      if (stderr) {
        reject(`Standard error: ${stderr}`);
        return;
      }
      resolve(stdout);
    });
  });
}
