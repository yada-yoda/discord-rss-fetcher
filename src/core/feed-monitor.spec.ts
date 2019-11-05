import { Expect, Setup, Test, TestFixture } from "alsatian"
import { Collection, GuildChannel } from "discord.js"
import { LiteClient } from "disharmony"
import { IMock, It, Mock, Times } from "typemoq"
import Feed from "../models/feed"
import Guild from "../models/guild"
import RssArticle from "../service/rss-reader/abstract/rss-article"
import RssFetcher from "../service/rss-reader/abstract/rss-fetcher"
import ArticlePoster from "./article-poster"
import FeedMonitor from "./feed-monitor"

@TestFixture("Feed monitor")
export class FeedMonitorTestFixture
{
    private feedUrl = "feed-url"
    public channelId = "channel-id"
    public roleId = "role-id"
    public articleLink = "article-link"

    private client: LiteClient

    private mockArcitlePoster: IMock<ArticlePoster>
    private mockGuild: IMock<Guild>
    private mockFeed: IMock<Feed>
    private mockArticle: IMock<RssArticle>
    private mockRssFetcher: IMock<RssFetcher>

    @Setup
    public setup()
    {
        this.mockGuild = Mock.ofType<Guild>()
        this.mockGuild.setup(x => x.channels).returns(() => new Map([[this.channelId, {} as any]]) as Collection<string, GuildChannel>)
        this.mockGuild.setup(x => x.feeds).returns(() => [this.mockFeed.object])

        this.mockArcitlePoster = Mock.ofType<ArticlePoster>()

        this.mockFeed = Mock.ofType<Feed>()
        this.mockFeed.setup(x => x.url).returns(() => this.feedUrl)
        this.mockFeed.setup(x => x.channelId).returns(() => this.channelId)
        this.mockFeed.setup(x => x.roleId).returns(() => this.roleId)

        this.mockArticle = Mock.ofType<RssArticle>()
        this.mockArticle.setup(x => x.link).returns(() => this.articleLink)

        this.mockRssFetcher = Mock.ofType<RssFetcher>()
        this.mockRssFetcher
            .setup(x => x.fetchArticles(It.isAnyString()))
            .returns(() => Promise.resolve([this.mockArticle.object]))

        const client = {} as any
        client.djs = { guilds: new Map<string, Guild>() }
        client.config = { requiredPermissions: 1 }
        this.client = client as LiteClient

    }

    @Test()
    public async article_posted_if_new_article_with_link_not_in_history()
    {
        // ARRANGE
        this.mockFeed.setup(x => x.isLinkInHistory(It.isAnyString())).returns(() => false)

        // ACT
        const sut = new FeedMonitor(this.client, this.mockRssFetcher.object, this.mockArcitlePoster.object)
        const didPostNewArticle = await sut.fetchAndProcessFeed(this.mockGuild.object, this.mockFeed.object)

        // ASSERT
        Expect(didPostNewArticle).toBe(true)

        this.mockArcitlePoster.verify(x => x.postArticle(
            this.mockGuild.object,
            this.channelId,
            this.mockArticle.object,
            this.roleId),
            Times.once())
    }

    @Test()
    public async link_pushed_to_history_if_new_article_with_link_not_in_history()
    {
        // ARRANGE
        this.mockFeed.setup(x => x.isLinkInHistory(It.isAnyString())).returns(() => false)

        // ACT
        const sut = new FeedMonitor(this.client, this.mockRssFetcher.object, this.mockArcitlePoster.object)
        await sut.fetchAndProcessFeed(this.mockGuild.object, this.mockFeed.object)

        // ASSERT
        this.mockFeed.verify(x => x.pushHistory(this.articleLink), Times.once())
    }

    @Test()
    public async article_not_posted_or_stored_if_link_already_in_history()
    {
        // ARRANGE
        this.mockFeed.setup(x => x.isLinkInHistory(It.isAnyString())).returns(() => true)

        // ACT
        const sut = new FeedMonitor(this.client, this.mockRssFetcher.object, this.mockArcitlePoster.object)
        const didPostNewArticle = await sut.fetchAndProcessFeed(this.mockGuild.object, this.mockFeed.object)

        // ASSERT
        Expect(didPostNewArticle).toBe(false)
        this.mockArcitlePoster.verify(x =>
            x.postArticle(It.isAny(), It.isAny(), It.isAny(), It.isAny()),
            Times.never())
        this.mockFeed.verify(x =>
            x.pushHistory(It.isAnyString()),
            Times.never())
    }

    @Test()
    public async no_exception_thrown_if_no_articles()
    {
        // ARRANGE
        void (this.mockRssFetcher.object.fetchArticles(""))
        this.mockRssFetcher.setup(x => x.fetchArticles(It.isAnyString())).returns(() => Promise.resolve([]))

        // ACT
        const sut = new FeedMonitor(this.client, this.mockRssFetcher.object, this.mockArcitlePoster.object)
        const didPostNewArticle = await sut.fetchAndProcessFeed(this.mockGuild.object, this.mockFeed.object)

        // ASSERT
        Expect(didPostNewArticle).toBe(false)
        // Expect no exception to be thrown (test will fail on exceptions)
    }

    @Test()
    public async feed_not_processed_if_channel_doesnt_exist()
    {
        // ARRANGE
        // tslint:disable-next-line: no-unused-expression
        void (this.mockFeed.object.channelId)
        this.mockFeed.setup(x => x.channelId).returns(() => "non-existent-channel")

        // ACT
        const sut = new FeedMonitor(this.client, this.mockRssFetcher.object, this.mockArcitlePoster.object)
        const didPostNewArticle = await sut.fetchAndProcessFeed(this.mockGuild.object, this.mockFeed.object)

        // ASSERT
        Expect(didPostNewArticle).toBe(false)
        this.mockArcitlePoster.verify(x =>
            x.postArticle(It.isAny(), It.isAny(), It.isAny(), It.isAny()),
            Times.never())
    }
}