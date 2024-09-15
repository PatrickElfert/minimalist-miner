import { Controller, Get, UsePipes } from '@nestjs/common';
import { AppService } from './app.service';
import { Param } from '@nestjs/common';
import { z } from 'zod';
import { extendApi } from '@anatine/zod-openapi';
import { createZodDto, ZodValidationPipe } from '@anatine/zod-nestjs';
import { getJapaneseLanguage, getSubtitles } from './subtitles/fetch-subtitles';
import { tokenizeSentence } from './subtitles/parse-subtitles';
import { TokenResult, tokenSchema } from './subtitles/segmentation-schema';
import {ApiCreatedResponse, ApiResponse} from '@nestjs/swagger';

const TokenizedSubtitleResponseSchema = extendApi(
  z.object({
    tokens: z.array(tokenSchema),
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
  @ApiCreatedResponse({
    type: [TokenizedSubtitleResponseDto],
  })
  @Get('subtitles/:id')
  async getTokenizedSubtitles(
    @Param('id') id: string,
  ): Promise<TokenizedSubtitleResponseDto[]> {
     console.log(`Getting subtitles for ${id}`);

    const lang = await getJapaneseLanguage(id);
    const subtitles = await getSubtitles(lang);
    const tokenizedSubtitlesResponse: TokenizedSubtitleResponseDto[] = [];

    const tokenPromises: Promise<TokenResult[]>[] = subtitles.map((s) =>
      tokenizeSentence(s.text),
    );
    const resultTokens = await Promise.all(tokenPromises);

    for (const [index, subtitle] of subtitles.entries()) {
      tokenizedSubtitlesResponse.push({
        tokens: resultTokens[index],
        start: Number(subtitle.start),
        end: Number(subtitle.dur) + Number(subtitle.start),
      });
    }

      console.log(`Returning subtitles for ${id}`);

      return tokenizedSubtitlesResponse;
  }
}
