import RssArticle from "./rss-article"
import { RssParser } from "../rss-parser";

export default interface RssFetcher
{
    fetchArticles(url: string): Promise<RssArticle[]>
    validateFeed(url: string): Promise<boolean>
}

let rssReader: RssFetcher
export function getRssReader(): RssFetcher
{
    if (!rssReader)
        rssReader = new RssParser()
    return rssReader
}