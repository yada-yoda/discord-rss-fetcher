//node imports
const FileSystem = require("fs");

//external lib imports
const JSONFile = require("jsonfile");

//my imports
const Util = require("discordjs-util");

//app component imports
const GuildData = require("./models/guild-data.js");
const FeedData = require("./models/feed-data.js");

const SAVE_FILE = "./guilds.json";

//acts as on ready function
module.exports = (client) => {
	const config = require("./config.json");
	const guildsData = FileSystem.existsSync(SAVE_FILE) ? parseJSON(JSONFile.readFileSync(SAVE_FILE)) : {}; //pull saved data from file

	parseLinksInAllGuilds(client.guilds, guildsData).then(writeFile(guildsData));

	//set up an interval to check all the feeds

	//set up an on message handler to detect when links are posted
	client.on("message", message => {
		if (message.member.id !== client.user.id) { //make sure the bot ignores itself

			//check if the user is admin and is invoking the add feed command
			if (message.member.permissions.has("ADMINISTRATOR") && message.content.startsWith(config.commands.setup)) {
				const feedData = createNewFeed(message); //create a new feed data instance from the data in our message

				//ask the user if they're happy with the details they set up, save if yes, don't if no
				Util.ask(client, message.channel, message.member, "Are you happy with this? " + feedData)
					.then(responseMessage => {

						//if they responded yes, save the feed and let them know, else tell them to start again
						if (message.content.toLowerCase() === "yes") {
							saveFeed(guildsData, message.guild.id, feedData);
							responseMessage.reply("Your new feed has been saved!");
						}
						else
							responseMessage.reply("Your feed has not been saved, please add it again with the correct details");

					});
			}
		}
	});
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

/**
 * Create a new feed from the message object where the user is setting it up
 * @param {Discord.Message} message 
 * @returns {FeedData} Newly created feed data object
 */
function createNewFeed(message) {
	const parameters = message.content.split(" "); //expect !addfeed <url> <channelName> <roleName>
	const feedData = new FeedData({
		link: parameters[1],
		channelName: parameters[2],
		roleName: parameters[3]
	});
	return feedData;
}

/**
 * Saves a passed feed data object into the passed guildsData object, for the specified guild
 * @param {object} guildsData 
 * @param {string} guildID 
 * @param {FeedData} feedData 
 */
function saveFeed(guildsData, guildID, feedData) {
	if(!guildsData[guildID])
		guildsData[guildID] = new GuildData({ id: guildID, feeds: [] });

	guildsData[guildID].feeds.push(feedData);
}

function parseJSON(json) {
	const guildIDs = Object.keys(json);
	guildIDs.forEach(guildID => { guildIDs[guildID] = new GuildData(guildIDs[guildID]); });
}

function writeFile(guildsData) {
	JSONFile.write(SAVE_FILE, guildsData, err => { if (err) Util.dateError(err); });
}