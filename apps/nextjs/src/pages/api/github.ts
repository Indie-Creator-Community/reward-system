import type { NextApiRequest, NextApiResponse } from 'next';
import { IssueActions, IssueColors, type GithubEventResponse } from '~/common';

type Override<T1, T2> = Omit<T1, keyof T2> & T2;

type GithubEventRequest = Override<NextApiRequest, { body: GithubEventResponse }>;
/**
 * Handles GitHub events and sends a message to a Discord channel.
 * @param {GithubEventRequest} req - The GitHub event request.
 * @param {NextApiResponse} res - The API response.
 */
export default async function handler(req: GithubEventRequest, res: NextApiResponse) {
  try {
    const { issue, action, repository, pull_request } = req.body;
    if (action === IssueActions.opened || action === IssueActions.closed) {
      const color: string = IssueColors[action];
      let embed = {
        color,
        title: '',
        description: '',
        url: '',
        author: {
          name: '',
          icon_url: '',
          url: '',
        },
      };

      if (issue) {
        embed = {
          ...embed,
          title: `[${repository.name}] Issue ${action}: #${issue.number} ${issue.title}`,
          url: issue.url,
          description: issue.body,
          author: {
            name: issue.user.login,
            icon_url: issue.user.avatar_url,
            url: issue.user.html_url,
          },
        };
      }

      if (pull_request) {
        embed = {
          ...embed,
          title: `[${repository.name}] Pull Request ${action}: #${pull_request.number} ${pull_request.title}`,
          url: pull_request.url,
          description: pull_request.body,
          author: {
            name: pull_request.user.login,
            icon_url: pull_request.user.avatar_url,
            url: pull_request.user.html_url,
          },
        };
      }

      const input = JSON.stringify({
        '0': {
          json: {
            data: {
              embeds: [embed],
            },
            webhookDiscordUrl: process.env.DISCORD_WEBHOOK_URL ?? '',
            // TODO: get Indies Tokens property
            // coins: '2000',
          },
        },
      });

      await fetch(`${process.env.API_URL}/api/trpc/bot.sendDiscordGithubMsg?batch=1`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: input,
      });

      res.status(200).json({ message: 'Message sent to Discord channel' });
    }
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
}
