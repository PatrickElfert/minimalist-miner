import { Controller, Get, UsePipes } from '@nestjs/common';
import { AppService } from './app.service';
import { Param } from '@nestjs/common';
import { z } from 'zod';
import { extendApi } from '@anatine/zod-openapi';
import { createZodDto, ZodValidationPipe } from '@anatine/zod-nestjs';
import { getJapaneseLanguage, getSubtitles } from './subtitles/fetch-subtitles';
import { Token, tokenizeSentence } from './subtitles/parse-subtitles';

const TokenizedSubtitleResponseSchema = extendApi(
  z.object({
    tokens: z.array(
      z.object({
        text: z.string(),
        meaning: z.string(),
      }),
    ),
    start: z.number(),
    end: z.number(),
  }),
);

export class TokenizedSubtitleResponseDto extends createZodDto(
  TokenizedSubtitleResponseSchema,
) {}

@Controller()
@UsePipes(ZodValidationPipe)
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('subtitles/:id')
  async getTokenizedSubtitles(@Param('id') id: string): Promise<any[]> {
    const lang = await getJapaneseLanguage(id);
    const subtitles = await getSubtitles(lang);
    const tokenizedSubtitlesResponse: TokenizedSubtitleResponseDto[] = [];

    const tokenPromises: Promise<Token[]>[] = subtitles.map((s) =>
      tokenizeSentence(s.text),
    );
    const resultTokens = await Promise.all(tokenPromises);

    for (const [index, subtitle] of subtitles.entries()) {
      tokenizedSubtitlesResponse.push({
        tokens: resultTokens[index].map((token) => ({
          text: token.text,
          meaning: token.gloss ? token.gloss[0]?.gloss : '',
        })),
        start: Number(subtitle.start),
        end: Number(subtitle.dur) + Number(subtitle.start),
      });
    }

    return tokenizedSubtitlesResponse;
  }
}
