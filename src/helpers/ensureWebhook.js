import { client } from "../client.js";
import { webhooks } from "../config.js";

export async function ensureWebhook(channel) {
  console.debug(`Ensuring webhook for channel ${channel.name}`);
  const name = `Translate Bot #${channel.name} - don't touch!`;
  const existingWebhooks = await client.getChannelWebhooks(channel.id);
  const existingWebhook = existingWebhooks.find((webhook) => webhook.name === name);
  if (existingWebhook) {
    webhooks.set(channel.id, existingWebhook);
    return;
  }

  const webhook = await client.createChannelWebhook(channel.id, { name }, "Translate Bot setup");
  webhooks.set(channel.id, webhook);
  return;
}
