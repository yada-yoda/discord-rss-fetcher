import { Guild as DjsGuild, TextChannel } from "discord.js"
import { Logger } from "disharmony"
import * as HtmlToText from "html-to-text"
import Guild from "../models/guild"
import RssArticle from "../service/rss-reader/abstract/rss-article"

const overallCharacterLimit = 750
const articleFormattingShort = "\n{{article}}"
const articleFormattingLong = "\n{{article}}..."
const articleContentCharacterLimit = 250

export default class ArticlePoster
{
    public async postArticle(guild: Guild | DjsGuild, channelId: string, article: RssArticle, roleId: string)
    {
        const channel = guild.channels.get(channelId) as TextChannel
        const message = this.formatPost(article)

        try
        {
            await channel.send((roleId ? `<@&${roleId}>` : "") + message)
        }
        catch (e)
        {
            Logger.debugLogError(`Error posting article in channel ${channel.name} in guild ${channel.guild.name}`, e)
        }
    }

    private formatPost(article: RssArticle)
    {
        const title = article.title ? `\n**${article.title}**` : ""
        const link = article.link ? `\n${article.link}` : ""

        let message = title

        if (article.content)
        {
            let articleString = HtmlToText.fromString(article.content)
            const isTooLong = articleString.length > articleContentCharacterLimit

            articleString = isTooLong ? articleString.substr(0, articleContentCharacterLimit) : articleString

            message +=  (isTooLong ? articleFormattingLong : articleFormattingShort).replace("{{article}}", articleString)
        }
        message += link.length <= overallCharacterLimit ? link : link.substr(0, overallCharacterLimit)

        return message
    }
}