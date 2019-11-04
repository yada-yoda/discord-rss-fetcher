import { DisharmonyGuild } from "disharmony"
import Feed from "./feed"

export default class Guild extends DisharmonyGuild
{
    private _feeds: Feed[]
    public get feeds(): Feed[]
    {
        if (!this._feeds)
            this.createFeedsBacking()
        return this._feeds
    }
    public set feeds(value: Feed[])
    {
        this.record.feeds = value
        this.createFeedsBacking()
    }

    public get channels() { return this.djs.channels }

    public loadRecord(record: any)
    {
        super.loadRecord(record)
        if (!this.record.feeds)
            this.record.feeds = []
    }

    private createFeedsBacking()
    {
        this._feeds = Feed.getArrayProxy(this.record.feeds, this, "feeds", Feed)
    }
}