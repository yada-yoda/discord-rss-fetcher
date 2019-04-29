import RssArticle from "../service/rss-reader/abstract/rss-article";
import { ClientWorker, Logger } from "disharmony";
import Guild from "../models/guild";
import RssFetcher, { getRssFetcher } from "../service/rss-reader/abstract/rss-fetcher";
import { promisify } from "util"
import * as Dns from "dns"
import * as Url from "url"
import ArticlePoster from "./article-poster"
import { TextChannel } from "discord.js";

export class ChannelArticle
{
    constructor(
        public article: RssArticle,
        public channelId: string,
        public roleId: string
    ) { }
}

export default class FeedMonitor extends ClientWorker
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
                await this.fetchAndProcessAllGuildFeeds(guild)
                await guild.save()
            }
    }

    private async fetchAndProcessAllGuildFeeds(guild: Guild)
    {
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

                await ArticlePoster.postArticle(channel, article)
            }
            catch (e)
            {
                Logger.debugLog(`Error fetching feed ${feed.url} in guild ${guild.id}\n${e.message || e}`, true)
            }
        }
    }
}