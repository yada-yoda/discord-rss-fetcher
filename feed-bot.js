var Discord = require("discord.io");
var Config = require("./config.json");
var console = require("console");

var bot = new Discord.Client({
	token: Config.token,
	autorun: true
});

bot.on("ready", function () {
	console.log(bot.username + " - (" + bot.id + ")");
});

bot.on("message", function (user, userID, channelID, message) {
	if (message === "ping") {
		bot.sendMessage({
			to: channelID,
			message: "pong"
		});
	}
});