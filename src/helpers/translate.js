import { default as googleSDK } from "@google-cloud/translate";
import { hashString } from "./hashString.js";
import findUp from "find-up";
import fs from "fs";
import urlRegex from "url-regex";

const serviceKeyPath = findUp.sync("service-account.json");
if (!serviceKeyPath) throw new Error("Could not find service-account.json");
const credentials = JSON.parse(fs.readFileSync(serviceKeyPath));
const translateAPI = new googleSDK.v2.Translate({ projectId: credentials.project_id, keyFilename: serviceKeyPath });

// patterns borrowed from https://github.com/KyzaGitHub/message-translate/blob/master/TranslationHandler/index.js
// because their regex was better then mine :^)
const MARKDOWN_REGEX = /<@(!?|&?)\d+>|<#\d+>|<(\w+)?:\w+:\d+>|```(.+?|\n+)```|`(.+?|\n+)`/gis;
const URL_REGEX = urlRegex();
const REF_REGEX = /TR[0-9]{1,}/g;

export async function translate(message, targetLocale) {
  if (message.length <= 1) return message;
  const start = Date.now();
  const hash = hashString(message.toLowerCase());

  // google translate will utterly destroy things like mentions, emojis and codeblocks.
  // we strip them before it gets its greasy hands on them to prevent that
  // and also save some characters
  let idCounter = 0;
  const markdownStore = new Map();
  const replaceUtil = (match) => {
    const ref = `TR${idCounter++}`;
    markdownStore.set(ref, match);
    return ref;
  };

  const input = message.replace(MARKDOWN_REGEX, replaceUtil).replace(URL_REGEX, replaceUtil);
  console.debug(`Translating ${hash}`);
  const [translation] = await translateAPI.translate(input, targetLocale);
  const translatedText = translation.replace(REF_REGEX, (match) => markdownStore.get(match) ?? match);
  console.debug(`Translated ${hash} in ${Date.now() - start}ms`);
  return translatedText;
}
