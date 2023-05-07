import { readdirSync } from 'fs';
import { join } from 'path';
import { type Client } from 'discord.js';
import { type BotEvent } from '../@types/discord';

// This code loads event files from a directory, creates a new event and registers it with the Discord client. The event can be executed once or on every occurrence, and the function logs the name of the event when successfully loaded.
module.exports = (client: Client) => {
  const eventsDir = join(__dirname, '../events');

  readdirSync(eventsDir).forEach((file) => {
    if (!file.endsWith('.ts')) return;
    const event: BotEvent = require(`${eventsDir}/${file}`).default as BotEvent;
    event.once
      ? client.once(event.name, (...args) => event.execute(...args))
      : client.on(event.name, (...args) => event.execute(...args));
    console.log(`🌠 Successfully loaded event ${event.name}`);
  });
};
