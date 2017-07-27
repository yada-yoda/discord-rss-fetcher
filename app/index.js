//node imports
const FileSystem = require("fs");

//external lib imports
const JSONFile = require("jsonfile");

//app component imports
const GuildData = require("./models/guild-data.js");

const SAVE_FILE = "./guilds.json";

//acts as on ready function
module.exports = (client) => {
	const guildsData = FileSystem.existsSync(SAVE_FILE) ? parseJSON(JSONFile.readFileSync(SAVE_FILE)) : {}; //pull saved data from file

	//set up an interval to check all the feeds

	//set up an on message handler to detect when links are posted
};

function parseJSON(json) {
	const guildIDs = Object.keys(json);
	guildIDs.forEach(guildID => { guildIDs[guildID] = new GuildData(guildIDs[guildID]); });
}