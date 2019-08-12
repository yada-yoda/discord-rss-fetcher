import { TextChannel } from "discord.js"
import { NotifyPropertyChanged, SubDocument } from "disharmony"
import Normalise from "../core/normaliser"
import Guild from "./guild"

export default class Feed extends SubDocument implements NotifyPropertyChanged
{
    private maxHistoryCount = 10
    private history: string[] = []

    public id: string
    public url: string
    public channelId: string
    public roleId: string

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

    public loadRecord(record: any)
    {
        this.id = record.id
        this.url = record.url
        this.channelId = record.channelId
        this.roleId = record.roleId
        this.history = record.history
    }

    public toFriendlyObject(guild: Guild)
    {
        const channel = guild.channels.get(this.channelId)
        const channelName = channel instanceof TextChannel ? channel.name : "<<unavailable>>"
        const role = guild.djs.roles.get(this.roleId)
        const roleName = role ? role.name : "<<N/A>>"
        return {
            id: this.id,
            url: this.url,
            channel: channelName,
            role: roleName,
        }
    }

    public static create(id: string, url: string, channelId: string, roleId?: string): Feed
    {
        const feed = new Feed()
        feed.id = id
        feed.url = url
        feed.channelId = channelId

        if (roleId)
            feed.roleId = roleId

        return feed
    }
}