//node imports
const FileSystem = require("fs");

//external lib imports
const Dicsord = require("discord.js");
const JSONFile = require("jsonfile");

//my imports
const Util = require("discordjs-util");

//app component imports
const GuildData = require("./models/guild-data.js");

const SAVE_FILE = "./guilds.json";

//acts as on ready function
module.exports = (client) => {
	const guildsData = FileSystem.existsSync(SAVE_FILE) ? parseJSON(JSONFile.readFileSync(SAVE_FILE)) : {}; //pull saved data from file

	parseLinksInAllGuilds(client.guilds, guildsData).then(writeFile);

	//set up an interval to check all the feeds

	//set up an on message handler to detect when links are posted
};

function parseLinksInAllGuilds(guilds, guildsData) {
	const promises = [];
	for (let guild of guilds) {
		const guildData = guildsData[guild.id];
		if (guildData)
			promises.push(guildData.cachePastPostedLinks());
	}
	return Promise.all(promises);
}

function parseJSON(json) {
	const guildIDs = Object.keys(json);
	guildIDs.forEach(guildID => { guildIDs[guildID] = new GuildData(guildIDs[guildID]); });
}

function writeFile(guildsData){
	JSONFile.write(SAVE_FILE, guildsData, err => {if(err) Util.dateError(err); });
}