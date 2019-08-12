import * as Parser from "rss-parser"
import RssArticle from "./abstract/rss-article"
import RssFetcher from "./abstract/rss-fetcher"

export class RssParser implements RssFetcher
{
    public async fetchArticles(url: string)
    {
        return (await this.parser.parseURL(url)).items as RssArticle[]
    }

    public async validateFeed(url: string)
    {
        /* Use the existence of a title to determine the validity of a feed.
           It's not particularly clear what elements make up the minimum valid feed,
           but a few online sources indicate that a title is one such necessary component. */
        return !!(await this.parser.parseURL(url)).title
    }

    constructor(
        // @ts-ignore
        private parser = new Parser({ timeout: 5000 }),
    ) { }
}