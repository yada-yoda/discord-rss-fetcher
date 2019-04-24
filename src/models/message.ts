import { BotMessage } from "disharmony";
import { Message as DjsMessage } from "discord.js"
import Guild from "./guild";

export default class Message extends BotMessage
{
    public readonly guild: Guild

    constructor(djsMessage: DjsMessage)
    {
        super(djsMessage);
        this.guild = new Guild(djsMessage.guild)
    }
}