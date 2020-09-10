import rc from "rc";
export const config = rc("translatebot");
export const webhooks = new Map();
export const channels = new Map();
config.channel_format = new RegExp(config.channel_format, "i");
