const Core = require("../core");
const GetUrls = require("get-urls");
const GuildData = require("./models/guild-data.js");
// @ts-ignore
const Config = require("./config.json");

const guildsIterator = (function* () {
    while (true) {
        if (client.guilds.size === 0)
            yield null;
        else
            for (let i = 0; i < client.guilds.size; i++)
                yield [...client.guilds.values()][i];
    }
})();

// @ts-ignore
const client = new Core.Client(require("../token.json"), __dirname + "/commands", GuildData);

client.on("beforeLogin", () =>
    setInterval(doGuildIteration, Config.feedCheckInterval));

client.on("ready", () => {
    parseLinksInGuilds().then(doGuildIteration);
    require("./legacy-upgrader.js")(); //upgrade legacy json into new database format
});

client.on("message", message => {
    if (message.channel.type !== "text" || !message.member)
        return;

    client.guildDataModel.findOne({ guildID: message.guild.id })
        .then(guildData => guildData && cacheUrlsInMessage(message, guildData));
});

client.bootstrap();

//INTERNAL FUNCTIONS//
function parseLinksInGuilds() {
    const promises = [];

    client.guildDataModel.find().then(guildDatas =>
        guildDatas
            .filter(guildData => client.guilds.get(guildData.guildID))
            .map(guildData => ({ guildData, guild: client.guilds.get(guildData.guildID) }))
            .forEach(({ guildData, guild }) => promises.push(guildData.cachePastPostedLinks(guild).catch()))
    );

    return Promise.all(promises);
}

function doGuildIteration() {
    const guild = guildsIterator.next().value;

    if (guild)
        client.guildDataModel.findOne({ guildID: guild.id })
            .then(guildData => guildData && checkGuildFeeds(guild, guildData));
}

function checkGuildFeeds(guild, guildData) {
    guildData.checkFeeds(guild)
        .then(values => values.some(x => x) && guildData.save());
}

function cacheUrlsInMessage(message, guildData) {
    const anyNewLinksPosted = [];

    guildData.feeds
        .filter(feedData => message.channel.id === feedData.channelID)
        .forEach(feedData => anyNewLinksPosted.push(feedData.cache(...GetUrls(message.content))));

    if (anyNewLinksPosted.some(x => x))
        guildData.save();
}