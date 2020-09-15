# translate-bot

A Discord bot that translates channels between languages.

# setup

translate-bot is intended on being used exclusively with [Docker](https://docs.docker.com/get-docker/).

1. Copy `.translatebotrc.example` from this repository to `.translatebotrc` on your system and fill it out.
   - Environment variables can also be used. `TRANSLATEBOT_mirror__channel_id=174917294757361` would define the mirror channel id.
2. Create a Google Translate API service account and download the key. Save it as `service-account.json`.
3. ```
   docker run -d --name translate-bot \
       -v /path/to/your/service-account.json:/opt/translate-bot/service-account.json \
       -v /path/to/your/.translatebotrc:/opt/translate-bot/.translatebotrc \
        sylver/translate-bot:master
   ```
   - Replace `/path/to/your/.translatebotrc` with the actual path to the `.translatebotrc` file you filled out.
