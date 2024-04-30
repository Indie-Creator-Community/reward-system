import { TRPCError } from '@trpc/server';
import { i18n } from '@acme/i18n';
import { TRPCErrorCode } from '../common';
import type { DiscordMsgType, SendDiscordMsgInputType } from '../schema/bot.schema';

const DISCORD_BOT_USERNAME = 'Reward System';

export const sendDiscordMsgHandler = async (input: {
  webhookDiscordUrl: string;
  data: DiscordMsgType;
}) => {
  try {
    input.data.username = DISCORD_BOT_USERNAME;

    if (!input.webhookDiscordUrl) {
      const message = i18n.t('api:bot.sendDiscordMsg.error.webhookNotFound', {
        url: input.webhookDiscordUrl,
      });

      throw new TRPCError({
        code: TRPCErrorCode.NOT_FOUND,
        message,
      });
    }

    await fetch(input.webhookDiscordUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input.data),
    })
      .then(() => console.log(i18n.t('api:bot.sendDiscordMsg.success')))
      .catch((error) => console.error(i18n.t('api:bot.sendDiscordMsg.error.internalError'), error));
  } catch (err: any) {
    throw err;
  }
};

export const sendDiscordRewardMsgHandler = async (input: SendDiscordMsgInputType) => {
  const data: DiscordMsgType = {
    username: DISCORD_BOT_USERNAME,
    content: i18n.t('api:bot.sendDiscordMsg.payload', {
      username: input.username,
      coins: input.coins,
      url: input.prUrl,
    }),
  };
  await sendDiscordMsgHandler({
    data,
    webhookDiscordUrl: input.webhookDiscordUrl,
  });
};
