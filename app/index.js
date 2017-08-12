//node imports
const FileSystem = require("fs");

//external lib imports
const JsonFile = require("jsonfile");

//my imports
const DiscordUtil = require("discordjs-util");

//global vars
const SAVE_FILE = "./guilds.json";

module.exports = (client) => {
	const config = require("./config.json");

	const guildsData = FileSystem.existsSync(SAVE_FILE) ? fromJSON(JsonFile.readFileSync(SAVE_FILE)) : {};
	setInterval(() => writeFile(guildsData), config.saveIntervalSec * 1000);

	client.on("message", message => {
		if (message.author.id !== client.user.id) { //check the bot isn't triggering itself
			if (message.channel.type === "dm")
				HandleMessage.DM(client, config, message);
			else if (message.channel.type === "text" && message.member)
				HandleMessage.Text(client, config, message, guildsData);
		}
	});
};

const HandleMessage = {
	DM: (client, config, message) => {
		message.reply("This bot does not have any handling for direct messages. To learn more or get help please visit http://benji7425.github.io, or join my Discord server here: https://discord.gg/SSkbwSJ");
	},
	Text: (client, config, message, guildsData) => {
		//handle admins invoking commands
		if (message.content.startsWith(message.guild.me.toString()) //user is @mention-ing the bot
			&& message.member.permissions.has("ADMINISTRATOR")) //user has admin perms
		{
			const params = message.content.split(" "); //split the message at the spaces
			switch (params[1]) {
				//add handling for different commands here
				case config.commands.version:
					message.reply("v" + require("../package.json").version);
					break;
			}
		}
	}
};

function writeFile(guildsData) {
	JsonFile.writeFile(SAVE_FILE, guildsData, err => { if (err) DiscordUtil.dateError("Error writing file", err); });
}

function fromJSON(json) {
	throw "Not implemented";
}