import { BotGuild } from "disharmony";
import Feed from "./feed";

export default class Guild extends BotGuild
{
    public get feeds(): Feed[]
    {
        if (!this.record.feeds)
            this.record.feeds = []
        return new Proxy(this.record.feeds, {
            get: (target, prop) =>
            {
                if (typeof prop === "string" && !isNaN(Number(prop)) && !(target[prop] instanceof Feed))
                {
                    const feed = Feed.fromData(target[prop])
                    feed.onPropertyChanged.sub(() => this.addSetOperator(`feeds.${prop}`, feed.toRecord()))
                    target[prop] = feed
                }
                return target[prop]
            },
            set: (target, prop, value) =>
            {
                target[prop] = value
                if (!isNaN(Number(prop)))
                    this.addSetOperator(`feeds.${prop as string}`, (value as Feed).toRecord())
                return true
            }
        })
    }
    public set feeds(value: Feed[]) { this.record.feeds = value }

    public get channels() { return this.djs.channels }
}