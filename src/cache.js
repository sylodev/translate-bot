import Keyv from "keyv";
export const cache = new Keyv("sqlite://.tbcache", {
  ttl: 604800000, // 7 days
});
