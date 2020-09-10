import rawTranslate from "@k3rn31p4nic/google-translate-api";

// patterns borrowed from https://github.com/KyzaGitHub/message-translate/blob/master/TranslationHandler/index.js because
// they seemed better then what i was using
const MARKDOWN_REGEX = /<@(!?|&?)\d+>|<#\d+>|<(\w+)?:\w+:\d+>|```(.+?|\n+)```|`(.+?|\n+)`/gis;
const REF_REGEX = /REF__[0-9]{1,}/g;

export async function translate(message, options) {
  // google translate will utterly destroy things like mentions, emojis and codeblocks.
  console.debug(`Translating "${message.substring(0, 128)}"`);
  let idCounter = 0;
  const markdownStore = new Map();
  const input = message.replace(MARKDOWN_REGEX, (match) => {
    const ref = `REF__${idCounter++}`;
    markdownStore.set(ref, match);
    return ref;
  });

  const translated = await rawTranslate(input, { ...options });
  const translatedText = translated.text.replace(REF_REGEX, (match) => markdownStore.get(match) ?? match);
  console.debug(`Translation to "${translatedText.substring(0, 128)}"`);
  return translatedText;
}
