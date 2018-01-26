// @ts-nocheck
const NewGuildData = require("./models/guild-data.js");
const NewFeedData = require("./models/feed-data.js");
const FileSystem = require("fs");

module.exports = function () {
    if (!FileSystem.existsSync("./guilds.json"))
        return;

    const legacyJson = require("../guilds.json");

    for (let guildID of Object.keys(legacyJson)) {
        const guildData = NewGuildData.create({ guildID });

        for (let feed of legacyJson[guildID].feeds) {
            guildData.feeds.push(NewFeedData.create({
                feedID: feed.id,
                url: feed.url,
                roleID: feed.roleID,
                channelID: feed.channelID,
                cachedLinks: feed.cachedLinks,
                maxCacheSize: feed.maxCacheSize
            }));
        }

        guildData.save();
    }

    FileSystem.rename("./guilds.json", "./guilds.json.backup");
};