import * as getUrls from "get-urls"
import Message from "../models/message"

export default async function handleMessage(message: Message)
{
    const urls = getUrls(message.content)

    if (urls.size === 0)
        return

    await message.guild.loadDocument()

    for (const feed of message.guild.feeds)
        if (feed.channelId === message.channelId)
            feed.pushHistory(...urls)
    await message.guild.save()
}