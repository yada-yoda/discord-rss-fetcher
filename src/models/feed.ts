export default class Feed
{
    public history: string[]

    constructor(
        public id: string,
        public url: string,
        public channelId: string,
        public roleId?: string
    ) { }
}