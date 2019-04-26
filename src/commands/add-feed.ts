import Message from "../models/message";
import { Command, PermissionLevel, IClient } from "disharmony";
import * as Url from "url"
import * as ShortId from "shortid"
import Feed from "../models/feed";
import { getRssReader } from "../service/rss-reader/abstract/rss-fetcher";

async function invoke(params: string[], message: Message, client: IClient)
{
    //validate and retrieve channel ID
    if (message.mentions.channels.size === 0)
        throw new Error("Invalid channel")
    const channelId = message.mentions.channels.first().id

    //validate and retrieve feed URL
    const url = params[0]
    if (!isValid(url))
        throw new Error("Invalid URL")

    //retrieve (optional) roleID
    let roleId = ""
    if (message.mentions.roles.size > 0)
        roleId = message.mentions.roles.first().id

    //retrieve and validate against existing feeds for this channel
    const feeds = message.guild.feeds.filter(x => x.channelId == channelId)
    if (feeds.find(x => x.url == url))
        throw new Error("Feed already exists")

    //add new feed
    let newFeed = new Feed(ShortId.generate(), url, channelId, roleId)

    let prompt = `Are you happy with this? (y/n)\n\`\`\`JSON\n${JSON.stringify(newFeed, null, "\t")}\`\`\``
    let userResponse, commandResponse = ""
    while (commandResponse === "")
    {
        //request confirmation
        userResponse = (await Message.ask(client, message.channelId, prompt, message.member, true)).content.toLowerCase()

        if (userResponse === "y")
        {
            message.reply("Please wait while I validate the RSS feed")

            if (await getRssReader().validateFeed(url))
            {
                message.guild.feeds.push(newFeed)
                commandResponse = "Your new feed has been saved!"
            }
            else
                commandResponse = "This RSS feed is invalid"
        }
        else if (userResponse === "n")
            commandResponse = "Your feed has not been saved"
        else
            prompt = "Please enter **y** or **n** for yes or no"
    }
    return commandResponse
}

export default new Command(
    /*name*/            "add-feed",
    /*description*/     "Add an RSS feed to a channel, with optional role tagging",
    /*syntax*/          "add-feed <url> <#channel> [@role]",
    /*permissionLevel*/ PermissionLevel.Admin,
    /*invoke*/          invoke
)

function isValid(url: string): boolean
{
    return !!Url.parse(url).hostname
}