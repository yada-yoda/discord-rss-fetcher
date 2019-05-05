import { BotGuild } from "disharmony";
import Feed from "./feed";

export default class Guild extends BotGuild
{
    public get feeds(): Feed[]
    {
        if (!this.record.feeds)
            this.record.feeds = []
        return Feed.getArrayProxy(this.record.feeds, this, "feeds", Feed)
    }
    public set feeds(value: Feed[]) { this.record.feeds = value }

    public get channels() { return this.djs.channels }
}