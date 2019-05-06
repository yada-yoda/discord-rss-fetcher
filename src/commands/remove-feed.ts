import { Command, PermissionLevel } from "disharmony";
import Message from "../models/message";

async function invoke(params: string[], message: Message)
{
    const idx = message.guild.feeds.findIndex(feed => feed.id === params[0])
    if (!Number.isInteger(idx))
        throw new Error("Can't find feed with id " + params[0])

    message.guild.feeds.splice(idx, 1)
    return "Feed removed!"
}

export default new Command(
        /*name*/            "remove-feed",
        /*description*/     "Remove configured RSS feed by its ID",
        /*syntax*/          "remove-feed <id>",
        /*permissionLevel*/ PermissionLevel.Admin,
        /*invoke*/          invoke,
)