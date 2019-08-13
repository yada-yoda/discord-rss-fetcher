import { ILightClient, LightClient, loadConfig, Logger } from "disharmony"
import Feed from "../models/feed"
import Guild from "../models/guild"
import RssFetcher, { getRssFetcher } from "../service/rss-reader/abstract/rss-fetcher"
import ArticlePoster from "./article-poster"

export default class FeedMonitor
{
    public async beginMonitoring()
    {
        // TODO Handle discord disconnects
        while (true)
            for (const djsGuild of this.client.djs.guilds.values())
            {
                const guild = new Guild(djsGuild)

                // Allow the event queue to clear before processing the next guild if no perms in this one
                if (!guild.hasPermissions(this.client.config.requiredPermissions))
                {
                    await new Promise((resolve) => setImmediate(resolve))
                    continue
                }

                await guild.loadDocument()
                const didPostNewArticle = await this.fetchAndProcessAllGuildFeeds(guild)

                if (didPostNewArticle)
                    await guild.save()
            }
    }

    public async fetchAndProcessAllGuildFeeds(guild: Guild)
    {
        let didPostNewArticle = false
        for (const feed of guild.feeds)
            didPostNewArticle = await this.fetchAndProcessFeed(guild, feed) || didPostNewArticle
        return didPostNewArticle
    }

    public async fetchAndProcessFeed(guild: Guild, feed: Feed): Promise<boolean>
    {
        try
        {
            const articles = await this.rssFetcher.fetchArticles(feed.url)

            if (articles.length === 0)
                return false

            const article = articles[0], link = article.link

            if (!link || feed.isLinkInHistory(link))
                return false

            feed.pushHistory(link)

            await this.articlePoster.postArticle(guild, feed.channelId, article, feed.roleId)
            return true
        }
        catch (e)
        {
            Logger.debugLogError(`Error fetching feed ${feed.url} in guild ${guild.name}`, e)
            return false
        }
    }

    constructor(
        private client: ILightClient,
        private rssFetcher: RssFetcher,
        private articlePoster: ArticlePoster,
    )
    { }
}

if (!module.parent)
{
    const configPath = process.argv[2]
    const { config } = loadConfig(undefined, configPath)
    const client = new LightClient(config)
    const articlePoster = new ArticlePoster()
    const feedMonitor = new FeedMonitor(client, getRssFetcher(), articlePoster)
    client.login(config.token)
        .then(() => feedMonitor.beginMonitoring())
        .catch(async err =>
        {
            await (Logger.debugLogError("Error initialising feed monitor", err) as Promise<void>)
            process.exit(1)
        })
}