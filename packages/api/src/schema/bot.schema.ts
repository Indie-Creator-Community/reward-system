import { z, type TypeOf } from 'zod';

/*------------------------------------*/

export const sendDiscordMsgInput = z.object({
  username: z.string(),
  prUrl: z.string(),
  coins: z.string(),
  webhookDiscordUrl: z.string(),
});
export type SendDiscordMsgInputType = TypeOf<typeof sendDiscordMsgInput>;

/*------------------------------------*/

const DiscordMsgAuthorType = z.object({
  name: z.string().optional(),
  url: z.string().url().optional(),
  icon_url: z.string().url().optional(),
});

const DiscordMsgFieldType = z.object({
  name: z.string().optional(),
  value: z.string().optional(),
  inline: z.boolean().optional(),
});

const DiscordMsgFooterType = z.object({
  text: z.string().optional(),
  icon_url: z.string().url().optional(),
});

const DiscordMsgImageType = z.object({
  url: z.string().url().optional(),
});

const DiscordMsgEmbedType = z.object({
  title: z.string().optional(),
  color: z.union([z.number(), z.string()]).optional(),
  description: z.string().optional(),
  timestamp: z.date().optional(),
  url: z.string().url().optional(),
  author: DiscordMsgAuthorType.optional(),
  image: DiscordMsgImageType.optional(),
  thumbnail: DiscordMsgImageType.optional(),
  footer: DiscordMsgFooterType.optional(),
  fields: z.array(DiscordMsgFieldType).optional(),
});

/*------------------------------------*/

export const DiscordMsg = z.object({
  username: z.string().optional(),
  avatar_url: z.string().url().optional(),
  content: z.string().optional(),
  embeds: z.array(DiscordMsgEmbedType).optional(),
  components: z.any().array().optional(),
});

export type DiscordMsgType = TypeOf<typeof DiscordMsg>;

/*------------------------------------*/

export const sendDiscordGithubMsgInput = z.object({
  data: DiscordMsg,
  webhookDiscordUrl: z.string(),
});
export type SendDiscordGithubMsgInputType = TypeOf<typeof sendDiscordGithubMsgInput>;

/*------------------------------------*/
