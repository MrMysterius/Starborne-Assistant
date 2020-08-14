# How to use this Bot

## Quick Start

1. Invite the Bot

    You can't use the Bot if you don't invite the Bot on your Discord Server. So go and invite the Bot [here](https://discordapp.com/oauth2/authorize?client_id=713078504706539520&scope=bot&permissions=338944).
2. Consent
    If you want to use the Bot to it's full potential, then you have to give the Bot consent. You can do this by typing `SP::giveConsent` into a channel on the server where the Bot has access to it. Consent can always be revoked by using `SP::revokeConsent`.
3. Setup Channels
    You can either setup a **basic channel** that works just fine with just `spy-data`or `spy-report` in the name of the channel so `awesome-spy-data-channel` and `cool-spy-reports` are viable options since they both contain on of those string from before.
    But you could also use **Auto Channels** for your spy reports, wich have the option to make channels only for reports that belong to a specific hex that can also be diffrenciated from servers. Just type in any text channel, doesn't have to be one with on of the strings from before, `SP::enableAutoChannels` and the channel will accept spy reports and also but them in the correct auto created channel.
    If you are affraid that your server will be clunked up with auto channel, don't worry they will delete themselfs after **48 Hours** of not receiving a new spy report. That time is the default setting and can be modified to be from **1 Hours** to **7 Days**. Just use the `SP::setTimeout <time-in-minutes>` command to change it. Side note is that you you change the setting of channel your are currently in and sending these commands to.
    Since the Auto channels create a extra category to work in, you also have the option to change that category if you don't want to use that category. Just use the `SP::setCategory <category-id>` command.
    You can set the starborne server from wich spy reports are coming from for a channel aswell, very usefull if you have mutiple channels using the same category for auto channels. Just use the `SP::setStarborneServer <server-number>` command.
    If you want to disable a channel to not longer create auto channels use the `SP::disableAutoChannels` command. **:exclamation: :exclamation: WARNING, THIS WILL DELETE THE SETTING ON THAT CHANNEL :exclamation: :exclamation:**.

---

## Commands

## Help

Just displays some commands and other side infos.

## Ping

command: `ping`
aliases: `beep`

Pongs or Boops back at you...

## Detail

command: `detail <message-id>`
aliases: `d <message-id>`

Displays a spy report in detail if it got compressed

## Prefix

command: `setPrefix <new-server-prefix>`
aliases: `prefix`

If you have administrator permissions you can change the prefix of the server for the bot with this or if you use prefix or you have no permissions it displays the servers current prefix

## Travel

Travel Command

## Consent

command: `giveConsent`
aliases: `revokeConsent`

Gives or revokes consent for storing Messages

## Compare

command: `compare <message-id> <message-id>`
aliases: `c <message-id> <message-id>`

Compares two spy reports for a detail change in amount of fleets and fleet stats

## Channel Settings

command: `enableAutoChannels`
aliases: `disableAutoChannels, setStarborneServer, setTimeout, setCategory`

As mentioned above in the auto channel configuration
