//node imports
const FileSystem = require("fs"); //manage files
const Util = require("util");

//external lib imports
const Discord = require("discord.js");
const JsonFile = require("jsonfile"); //save/load data to/from json

const Config = require("./config.json");
const ParentPackageJSON = require("../package.json"); //used to provide some info about the bot
const DiscordUtil = require("./util.js"); //some discordjs helper functions of mine
const MessageHandler = require("./message-handler.js");

function bootstrap(token, component, guildDataModel, commands) {
	process.on("uncaughtException", (err) => {
		DiscordUtil.dateError("Uncaught exception!", err);
	});

	const client = new Discord.Client();

	client.on("ready", () => {
		onReady(client, component, guildDataModel, commands);

		client.user.setGame("benji7425.github.io");
		DiscordUtil.dateLog("Registered bot " + client.user.username);
	});

	client.on("disconnect", eventData => {
		DiscordUtil.dateError("Bot was disconnected!", eventData.code, eventData.reason);
	});

	client.login(token);
}

function onReady(client, component, guildDataModel, commands) {
	const saveFile = Util.format(Config.saveFile, ParentPackageJSON.name + "");

	const guildsData =
		FileSystem.existsSync(saveFile) ?
			fromJSON(JsonFile.readFileSync(saveFile), guildDataModel) : {};

	const writeFile = () =>
		JsonFile.writeFile(
			saveFile,
			guildsData,
			err => {
				if (err) DiscordUtil.dateError("Error writing file", err);
			});

	setInterval(() => writeFile(), Config.saveIntervalSec * 1000);

	client.on("message", message => {
		if (message.author.id !== client.user.id) {
			if (message.channel.type === "dm")
				MessageHandler.handleDirectMessage({ client, message });
			else if (message.channel.type === "text" && message.member)
				MessageHandler.handleTextMessage({ client, commands, message, guildDataModel, guildsData, component, writeFile });
		}
	});

	component.onReady(client, guildsData)
		.then(() => writeFile())
		.catch(err => DiscordUtil.dateError(err));
}

function fromJSON(json, guildDataModel) {
	const guildsData = Object.keys(json);
	guildsData.forEach(guildID => { json[guildID] = new guildDataModel(json[guildID]); });
	return json;
}

module.exports = bootstrap;