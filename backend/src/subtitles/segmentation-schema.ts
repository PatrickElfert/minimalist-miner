import { z } from 'zod';

export const glossSchema = z.object({
  pos: z.string(),
  gloss: z.string(),
  info: z.string(),
});

export const propSchema = z.object({
  pos: z.string(),
  type: z.string(),
});

export const conjSchema = z.object({
  prop: z.array(propSchema),
  reading: z.string(),
  gloss: glossSchema,
});

export const componentsSchema = z.object({
  reading: z.string(),
  text: z.string(),
  kana: z.string(),
  score: z.number(),
  seq: z.number(),
  conj: conjSchema,
});

export const tokenSchema = z.object({
  reading: z.string(),
  text: z.string(),
  kana: z.string(),
  score: z.number(),
  seq: z.number(),
  compound: z.array(z.string()),
  components: z.array(componentsSchema),
  gloss: z.array(glossSchema),
  conj: z.array(conjSchema),
});

export const segmentationSchema = z.array(
  z.union([
    z.array(
      z.array(
        z.array(
          z.union([
            z.array(z.union([z.string(), tokenSchema, z.array(z.unknown())])),
            z.number(),
          ]),
        ),
      ),
    ),
    z.string(),
  ]),
);

export type TokenResult = z.infer<typeof tokenSchema>;
export type SegmentationResult = z.infer<typeof segmentationSchema>;
