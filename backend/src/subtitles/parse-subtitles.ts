import { exec } from 'child_process';
import { writeFileSync } from 'fs';
import { SegmentationResult, TokenResult } from './segmentation-schema';

export async function tokenizeSentence(sentence: string) {
  const result = await execInContainer(
    'ichiran-main-1',
    `ichiran-cli -f ${sentence}`,
  );

  return await formatTokens(result);
}

async function formatTokens(cmdOutput: string): Promise<TokenResult[]> {
  const result = JSON.parse(cmdOutput) as SegmentationResult;

  writeFileSync('result.json', JSON.stringify(result));
  const parsed = parseTokens(result);
  return parsed;
}

function parseTokens(segmentationResult: SegmentationResult): TokenResult[] {
  const tokens: TokenResult[] = [];

  for (const segment of segmentationResult) {
    if (typeof segment === 'string') {
      tokens.push({
        text: segment,
      });
    }
    if (Array.isArray(segment)) {
      const newTokens = segment
        .map((arr) => arr[0][0])
        .map((arr) => arr[1] as TokenResult);
      tokens.push(...newTokens);
    }
  }

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
