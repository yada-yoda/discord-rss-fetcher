import { RssParser } from "../rss-parser"
import RssArticle from "./rss-article"

export default interface RssFetcher
{
    fetchArticles(url: string): Promise<RssArticle[]>
    validateFeed(url: string): Promise<boolean>
}

let rssReader: RssFetcher
export function getRssFetcher(): RssFetcher
{
    if (!rssReader)
        rssReader = new RssParser()
    return rssReader
}