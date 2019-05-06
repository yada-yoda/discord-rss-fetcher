import { TextChannel } from "discord.js";
import { LightClient, Logger } from "disharmony";
import Guild from "../models/guild";
import RssFetcher, { getRssFetcher } from "../service/rss-reader/abstract/rss-fetcher";
import ArticlePoster from "./article-poster"
import Normalise from "./normaliser"

export default class FeedMonitor
{
    private rssFetcher: RssFetcher = getRssFetcher()

    public async beginMonitoring()
    {
        // todo handle discord disconnects
        while (true)
            for (const djsGuild of this.client.djs.guilds.values())
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
        for (const feed of guild.feeds)
        {
            try
            {
                const articles = await this.rssFetcher.fetchArticles(feed.url)

                if (articles.length === 0)
                    continue

                const article = articles[0], link = article.link

                if (!link || feed.isLinkInHistory(link))
                    continue

                feed.pushHistory(Normalise.forCache(link))

                const channel = guild.channels.get(feed.channelId) as TextChannel

                await ArticlePoster.postArticle(channel, article, feed.roleId)
                hasPostedArticles = true
            }
            catch (e)
            {
                Logger.debugLogError(`Error fetching feed ${feed.url} in guild ${guild.id}`, e)
            }
        }
        return hasPostedArticles
    }

    constructor(
        private client: LightClient,
    )
    { }
}

if (!module.parent)
{
    const token = process.argv[2], dbConnectionString = process.argv[3]
    const client = new LightClient(dbConnectionString)
    const feedMonitor = new FeedMonitor(client)
    client.initialize(token)
        .then(() => feedMonitor.beginMonitoring())
        .catch(e => Logger.debugLogError("Error initialising feed monitor", e));
}