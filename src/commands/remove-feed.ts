import { Command, PermissionLevel } from "disharmony"
import Message from "../models/message"

async function invoke(params: string[], message: Message)
{
    const filtered = message.guild.feeds.filter(x => x.id !== params[0])

    if (filtered.length === message.guild.feeds.length)
        throw new Error("Can't find feed with id " + params[0])

    message.guild.feeds = filtered
    return "Feed removed!"
}

export default new Command(
        /*syntax*/          "remove-feed <id>",
        /*description*/     "Remove configured RSS feed by its ID",
        /*permissionLevel*/ PermissionLevel.Admin,
        /*invoke*/          invoke,
)