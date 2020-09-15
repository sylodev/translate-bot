import { default as googleSDK } from "@google-cloud/translate";
import { cache } from "../cache.js";
import { hashString } from "./hashString.js";
import findUp from "find-up";
import fs from "fs";

const serviceKeyPath = findUp.sync("service-account.json");
if (!serviceKeyPath) throw new Error("Could not find service-account.json");
const credentials = JSON.parse(fs.readFileSync(serviceKeyPath));
const translateAPI = new googleSDK.v2.Translate({ projectId: credentials.project_id, keyFilename: serviceKeyPath });

// patterns borrowed from https://github.com/KyzaGitHub/message-translate/blob/master/TranslationHandler/index.js because
// they seemed better then what i was using
const MARKDOWN_REGEX = /<@(!?|&?)\d+>|<#\d+>|<(\w+)?:\w+:\d+>|```(.+?|\n+)```|`(.+?|\n+)`/gis;
const REF_REGEX = /REF__[0-9]{1,}/g;

export async function translate(message, targetLocale) {
  if (message.length <= 1) return message;
  const hash = hashString(message);
  const cacheKey = targetLocale + hash;
  const cached = await cache.get(cacheKey);
  if (cached) {
    console.debug(`Cache hit for ${hash}`);
    return cached;
  }

  // google translate will utterly destroy things like mentions, emojis and codeblocks.
  console.debug(`Translating ${hash}`);
  let idCounter = 0;
  const markdownStore = new Map();
  const input = message.replace(MARKDOWN_REGEX, (match) => {
    const ref = `REF__${idCounter++}`;
    markdownStore.set(ref, match);
    return ref;
  });

  const [translation] = await translateAPI.translate(input, targetLocale);
  const translatedText = translation.replace(REF_REGEX, (match) => markdownStore.get(match) ?? match);
  await cache.set(cacheKey, translatedText);
  console.debug(`Translated ${hash}`);
  return translatedText;
}
