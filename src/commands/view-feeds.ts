import { Command, PermissionLevel } from "disharmony";
import Feed from "../models/feed";
import Guild from "../models/guild";
import Message from "../models/message";

const paginationLimit = 10

async function invoke(params: string[], message: Message)
{
    if (message.guild.feeds.length === 0)
        return "No feeds configured for this server"

    let startIdx = Number(params[0] || "")
    startIdx = !isNaN(startIdx) ? startIdx - 1 * paginationLimit : 0

    const endIdx = startIdx + paginationLimit + 1

    let responseStr = message.guild.feeds.slice(startIdx, endIdx).map(f => stringifyFeed(f, message.guild)).join("\n")
    if (message.guild.feeds.length > endIdx)
        responseStr += `Use *view-feeds ${startIdx + 2}* to view more`
    return responseStr || "No feeds configured"
}

export default new Command(
        /*name*/            "view-feeds",
        /*description*/     "Show the configured RSS feeds for this server",
        /*syntax*/          "view-feeds",
        /*permissionLevel*/ PermissionLevel.Admin,
        /*invoke*/          invoke,
)

function stringifyFeed(feed: Feed, guild: Guild): string
{
    return `\`\`\`JavaScript\n ${JSON.stringify(feed.toFriendlyObject(guild), null, "\t")} \`\`\``;
}