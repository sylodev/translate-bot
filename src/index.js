import { config, webhooks, channels } from "./config.js";
import { ensureWebhook } from "./helpers/ensureWebhook.js";
import { client } from "./client.js";
import { translate } from "./helpers/translate.js";

client.once("ready", async () => {
  const guild = client.guilds.get(config.guild);
  if (!guild) throw new Error("Could not find guild " + config.guild);
  for (const channel of guild.channels.values()) {
    if (channel.id === config.mirror.channel_id) await ensureWebhook(channel);
    else if (channel.type === 0) {
      const code = config.channel_format.exec(channel.name)?.groups?.code;
      if (!code) continue;
      await ensureWebhook(channel);
      channels.set(code, channel);
    }
  }

  console.log(`Ready as ${client.user.username}#${client.user.discriminator}`);
  if (config.status) client.editStatus({ status: "online" }, { type: 3, name: config.status });
});

client.on("messageCreate", async (msg) => {
  // prettier-ignore
  const userIsBlacklisted = msg.member?.roles.some((id) => config.blacklist_roles.includes(id))
  if (!msg.channel.guild || msg.author.bot || msg.channel.type !== 0 || userIsBlacklisted) {
    return;
  }

  const attachments = msg.attachments[0] ? ' ' + msg.attachments.map((attachment) => attachment.url).join(", ") : ""; // prettier-ignore
  if (msg.channel.id === config.mirror.channel_id) {
    const parts = msg.content.split(" ");
    const channelCode = parts.shift();
    const targetChannel = channels.get(channelCode);
    const withoutCode = parts.join(" ").trim();
    if (!targetChannel || (!withoutCode && !msg.attachments[0])) {
      if (!config.bot_prefixes.some(prefix => msg.content.startsWith(prefix))) {
        return await msg.addReaction("❓");
      }
    }

    const targetChannelWebhook = webhooks.get(targetChannel.id);
    const translatedText = await translate(withoutCode, { from: config.mirror.locale, to: channelCode });
    await client.executeWebhook(targetChannelWebhook.id, targetChannelWebhook.token, {
      content: translatedText + attachments,
      username: msg.author.username,
      avatarURL: msg.author.avatarURL,
    });

    await msg.addReaction("✅");
    return;
  }

  const userIsSupport = msg.member.roles.includes(config.support_role);
  if (userIsSupport) return; // translating support messages back to the mirror would be wasteful
  const channelCodeFromName = config.channel_format.exec(msg.channel.name)?.groups?.code;
  if (!channelCodeFromName) return;
  const channelWebhook = webhooks.get(config.mirror.channel_id);
  if (!channelWebhook) console.warn(`Could not get webhook for mirror ${config.mirror.channel_id}`);
  const translatedText = await translate(msg.content, { from: channelCodeFromName, to: config.mirror.locale });
  await client.executeWebhook(channelWebhook.id, channelWebhook.token, {
    content: translatedText + attachments,
    username: `${msg.author.username}#${msg.author.discriminator} (${channelCodeFromName} #${msg.channel.name})`,
    avatarURL: msg.author.avatarURL,
  });
});

client.connect();
