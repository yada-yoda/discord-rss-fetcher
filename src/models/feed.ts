import Normalise from "../core/normaliser";
import { NotifyPropertyChanged } from "disharmony";
import { SimpleEventDispatcher } from "strongly-typed-events"

export default class Feed implements NotifyPropertyChanged
{
    private maxHistoryCount = 10
    private history: string[] = []

    public onPropertyChanged = new SimpleEventDispatcher<string>()

    public isLinkInHistory(link: string): boolean
    {
        return this.history.indexOf(Normalise.forCache(link)) > -1
    }

    public pushHistory(...links: string[])
    {
        const newLinks = links.map(x => Normalise.forCache(x)).filter(x => !this.isLinkInHistory(x))
        Array.prototype.push.apply(this.history, newLinks)
        this.history.splice(0, this.history.length - this.maxHistoryCount)
        this.onPropertyChanged.dispatch("history")
    }

    public toRecord()
    {
        return {
            id: this.id,
            url: this.url,
            channelId: this.channelId,
            roleId: this.roleId,
            history: this.history,
        }
    }

    public static fromData(data: any)
    {
        const feed = new Feed(data.id, data.url, data.channelId, data.roleId)
        feed.history = data.history || []
        return feed
    }

    constructor(
        public id: string,
        public url: string,
        public channelId: string,
        public roleId?: string
    ) { }
}