import { Logger, WorkerClient } from "disharmony";
import Guild from "../models/guild";
import RssFetcher, { getRssFetcher } from "../service/rss-reader/abstract/rss-fetcher";
import { promisify } from "util"
import * as Dns from "dns"
import * as Url from "url"
import ArticlePoster from "./article-poster"
import { TextChannel } from "discord.js";

class FeedMonitor extends WorkerClient
{
    private rssFetcher: RssFetcher = getRssFetcher()

    public async beginMonitoring()
    {
        //todo handle discord disconnects
        while (true)
            for (let djsGuild of this.client.djs.guilds.values())
            {
                const guild = new Guild(djsGuild)
                await guild.loadDocument()
                const hasPostedArticles = await this.fetchAndProcessAllGuildFeeds(guild)

                if (hasPostedArticles)
                    await guild.save()
            }
    }

    private async fetchAndProcessAllGuildFeeds(guild: Guild): Promise<boolean>
    {
        let hasPostedArticles = false
        for (let feed of guild.feeds)
        {
            try
            {
                await (promisify(Dns.resolve)(Url.parse(feed.url).hostname!))
                    .catch(e => Logger.debugLog(`Unable to resolve host ${feed.url}\n${e.message || e}`, true))

                const articles = await this.rssFetcher.fetchArticles(feed.url)

                if (articles.length === 0)
                    continue

                const article = articles[0], link = article.link

                if (!link || feed.isLinkInHistory(link))
                    continue

                feed.pushHistory(link)

                const channel = guild.channels.get(feed.channelId) as TextChannel

                await ArticlePoster.postArticle(channel, article, feed.roleId)
                hasPostedArticles = true
            }
            catch (e)
            {
                Logger.debugLog(`Error fetching feed ${feed.url} in guild ${guild.id}\n${e.message || e}`, true)
            }
        }
        return hasPostedArticles
    }
}

const token = process.argv[2], dbConnectionString = process.argv[3]
const feedMonitor = new FeedMonitor(token, dbConnectionString)
feedMonitor.connect().then(() => feedMonitor.beginMonitoring());