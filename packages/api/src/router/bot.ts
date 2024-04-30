import { sendDiscordMsgHandler, sendDiscordRewardMsgHandler } from '../controllers/bot.controller';
import { sendDiscordGithubMsgInput, sendDiscordMsgInput } from '../schema/bot.schema';
import { createTRPCRouter, publicProcedure } from '../trpc';

export const botRouter = createTRPCRouter({
  sendDiscordMsg: publicProcedure
    .input(sendDiscordMsgInput)
    .mutation(async ({ input }) => sendDiscordRewardMsgHandler(input)),
  sendDiscordGithubMsg: publicProcedure
    .input(sendDiscordGithubMsgInput)
    .mutation(async ({ input }) => sendDiscordMsgHandler(input)),
});
