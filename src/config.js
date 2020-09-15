import rc from "rc";
export const config = rc("translatebot", {
  status: "for translations",
  blacklist_roles: [],
  channel_format: "support-(?<code>[a-z]+)",
  mirror: {
    locale: "en",
  },
});

export const webhooks = new Map();
export const channels = new Map();
config.channel_format = new RegExp(config.channel_format, "i");
