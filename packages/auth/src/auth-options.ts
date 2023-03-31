import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { createId } from '@paralleldrive/cuid2';
import { type DefaultSession, type NextAuthOptions } from 'next-auth';
import DiscordProvider, { type DiscordProfile } from 'next-auth/providers/discord';

import { prisma } from '@acme/db';

/**
 * Module augmentation for `next-auth` types
 * Allows us to add custom properties to the `session` object
 * and keep type safety
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 **/
declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string;
      // ...other properties
      // role: UserRole;
    } & DefaultSession['user'];
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

/**
 * Options for NextAuth.js used to configure
 * adapters, providers, callbacks, etc.
 * @see https://next-auth.js.org/configuration/options
 **/
export const authOptions: NextAuthOptions = {
  debug: true,
  adapter: PrismaAdapter(prisma),
  providers: [
    DiscordProvider<DiscordProfile>({
      clientId: process.env.DISCORD_CLIENT_ID as string,
      clientSecret: process.env.DISCORD_CLIENT_SECRET as string,

      profile(profile) {
        if (profile.avatar === null) {
          const defaultAvatarNumber = parseInt(profile.discriminator) % 5;
          profile.image_url = `https://cdn.discordapp.com/embed/avatars/${defaultAvatarNumber}.png`;
        } else {
          const format = profile.avatar.startsWith('a_') ? 'gif' : 'png';
          profile.image_url = `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.${format}`;
        }
        return {
          id: createId(),
          name: profile.username,
          email: profile.email,
          discordId: profile.id,
          discordUserName: profile.username,
          discordDiscriminator: profile.discriminator,
          thumbnail: profile.image_url,
        };
      },
    }),
    /**
     * ...add more providers here
     *
     * Most other providers require a bit more work than the Discord provider.
     * For example, the GitHub provider requires you to add the
     * `refresh_token_expires_in` field to the Account model. Refer to the
     * NextAuth.js docs for the provider you want to use. Example:
     * @see https://next-auth.js.org/providers/github
     **/
  ],
  callbacks: {
    /**
     * The callback -> signIn() is a function to next-auth
     * that permits you to customize the sign in process.
     * @param discordProfile
     * @returns
     */
    async signIn(discordProfile): Promise<boolean> {
      const { account, user } = discordProfile;

      //Find account data to check if account exists
      const findAccountUser = await prisma.account.findUnique({
        where: {
          provider_providerAccountId: {
            provider: 'discord',
            providerAccountId: account?.providerAccountId as string,
          },
        },
      });

      //If account exists, return true and sign in
      if (findAccountUser) return true;

      //Find user data to check if user exists
      const findUserByDiscordUsername = await prisma.user.findUnique({
        where: { discordUserName: user?.name as string },
        select: {
          id: true,
          discordUserName: true,
        },
      });

      //If user exists, update user data and create account
      if (findUserByDiscordUsername) {
        const updateUserDiscordIdAndEmail = await prisma.user.update({
          where: { discordUserName: findUserByDiscordUsername.discordUserName as string },
          data: {
            discordId: user?.id,
            email: user?.email,
          },
        });

        //If user data is updated, create account
        if (updateUserDiscordIdAndEmail) {
          const createAccount = await prisma.account.create({
            data: {
              userId: findUserByDiscordUsername.id,
              type: account?.type as string,
              provider: account?.provider as string,
              providerAccountId: account?.providerAccountId as string,
            },
          });

          if (!createAccount) {
            return false;
          }
        }

        return true;
      }

      return true;
    },
    session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        // session.user.role = user.role; <-- put other properties on the session here
      }
      return session;
    },
  },
};
