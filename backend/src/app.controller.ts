import {
  Controller,
  Get,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { AppService } from './app.service';
import { Param } from '@nestjs/common';
import { z } from 'zod';
import { extendApi, extendZodWithOpenApi } from '@anatine/zod-openapi';
import { createZodDto, ZodValidationPipe } from '@anatine/zod-nestjs';
import { getJapaneseLanguage, getSubtitles } from './subtitles/fetch-subtitles';
import { tokenizeSentence } from './subtitles/parse-subtitles';
import { TokenResult, tokenSchema } from './subtitles/segmentation-schema';
import { ApiBody, ApiConsumes, ApiCreatedResponse } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';

const TokenizedSubtitleResponseSchema = extendApi(
  z.object({
    tokens: z.array(tokenSchema),
    start: z.number(),
    end: z.number(),
  }),
);

const SubtitleSchemaResponse = extendApi(
  z.object({
    text: z.string(),
    start: z.number(),
    end: z.number(),
  }),
);

const GetTokenizedSubtitleQuerySchema = extendApi(
  z.object({
    text: z.string(),
  }),
);

const GetTokenizedSubtitleFileSchema = extendApi(
  z.object({
    file: extendApi(z.string(), { type: 'string', format: 'binary' }),
  }),
);

export class GetTokenizedSubtitleFileDto extends createZodDto(
  GetTokenizedSubtitleFileSchema,
) {}

export class GetTokenizedSubtitleQuery extends createZodDto(
  GetTokenizedSubtitleQuerySchema,
) {}

export class SubtitleResponseDto extends createZodDto(SubtitleSchemaResponse) {}

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
  @Get('subtitleToken/:id')
  async getTokenizedSubtitles(
    @Param('id') id: string,
  ): Promise<TokenizedSubtitleResponseDto[]> {
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
    return tokenizedSubtitlesResponse;
  }

  @Post('subtitleTokenFromSrt')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'List of cats',
    type: GetTokenizedSubtitleFileDto,
  })
  async getTokenizedSubtitlesFromSrt(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<TokenizedSubtitleResponseDto[]> {

      //Todo: SRT Parsers

    const subtitles = parser.fromSrt(file.buffer.toString('utf-8'));
    const tokenizedSubtitlesResponse: TokenizedSubtitleResponseDto[] = [];

    const tokenPromises: Promise<TokenResult[]>[] = subtitles.map((s) =>
      tokenizeSentence(s.text),
    );
    const resultTokens = await Promise.all(tokenPromises);

    for (const [index, subtitle] of subtitles.entries()) {
      tokenizedSubtitlesResponse.push({
        tokens: resultTokens[index],
        start: subtitle.startSeconds,
        end: subtitle.endSeconds,
      });
    }
    return tokenizedSubtitlesResponse;
  }

  @ApiCreatedResponse({
    type: TokenizedSubtitleResponseDto,
  })
  @Get('subtitleToken')
  async getTokenizedSubtitle(
    @Query() tokenizedSubtitleQuery: GetTokenizedSubtitleQuery,
  ): Promise<TokenizedSubtitleResponseDto> {
    console.log('Getting tokens');
    const tokenizedSubtitle = await tokenizeSentence(
      tokenizedSubtitleQuery.text,
    );
    console.log('Returning tokens');
    return {
      tokens: tokenizedSubtitle,
    };
  }

  @Get('subtitles/:id')
  @ApiCreatedResponse({
    type: [SubtitleResponseDto],
  })
  async getSubtitles(@Param('id') id: string): Promise<SubtitleResponseDto[]> {
    const lang = await getJapaneseLanguage(id);
    return (await getSubtitles(lang)).map((s) => ({
      text: s.text,
      start: Number(s.start),
      end: Number(s.start) + Number(s.dur),
    }));
  }
}
