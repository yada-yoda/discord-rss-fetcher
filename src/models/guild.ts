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
                if (typeof prop === "string" && !isNaN(Number(prop)))
                    target[prop] = Feed.fromData(target[prop])
                return target[prop]
            },
            set: (target, prop, value) => target[prop] = value
        })
    }
    public set feeds(value: Feed[]) { this.record.feeds = value }

    public get channels() { return this.djs.channels }
}