//node imports
const Util = require("util");

//external lib imports
const Discord = require("discord.js");

//lib components
const Config = require("./config.json"); //generic lib configuration
const DiscordUtil = require("./util.js"); //some discordjs helper functions of mine
const ParentPackageJSON = require("../package.json"); //used to provide some info about the bot

function handleDirectMessage(client, message) {
	message.reply(Util.format(Config.generic.defaultDMResponse, Config.generic.website, Config.generic.discordInvite));
}

function handleTextMessage({ client, commands, message, guildDataModel, guildsData, component, writeFile }) {
	const isCommand = message.content.startsWith(message.guild.me.toString());
	let guildData = guildsData[message.guild.id];

	if (!guildData)
		guildData = guildsData[message.guild.id] = new guildDataModel({ id: message.guild.id });

	if (isCommand) {
		Object.assign(commands, Config.commands);
		const userIsAdmin = message.member.permissions.has("ADMINISTRATOR");
		const botName = "@" + (message.guild.me.nickname || client.user.username);
		const { command, commandProp, params, expectedParamCount } = getCommandDetails(message, commands, userIsAdmin) || { command: null, commandProp: null, params: null, expectedParamCount: null };
		const invoke = component[commandProp];

		if (!command || !params || isNaN(expectedParamCount))
			return;

		switch (command) {
			case Config.commands.version:
				message.reply(`${ParentPackageJSON.name} v${ParentPackageJSON.version}`);
				break;
			case Config.commands.help:
				message.channel.send(createHelpEmbed(botName, commands, userIsAdmin));
				break;
			default:
				if (invoke && params.length >= expectedParamCount) {
					invoke({ params, guildData, botName, message, client })
						.then(msg => {
							message.reply(msg);
							writeFile();
						})
						.catch(err => {
							message.reply(err);
							DiscordUtil.dateError(err);
						});
				}
				else
					message.reply(`Incorrect syntax!\n**Expected:** *${botName} ${command.syntax}*\n**Need help?** *${botName} ${commands.help.command}*`);
				break;
		}
	}
	else
		component.onTextMessage(message, guildData);
}

function getCommandDetails(message, commands, userIsAdmin) {
	const splitMessage = message.content.toLowerCase().split(/ +/);
	const commandStr = splitMessage[1];
	const commandProp = Object.keys(commands).find(x => commands[x].command.toLowerCase() === commandStr);
	const command = commands[commandProp];

	if (!command || (command.admin && !userIsAdmin))
		return;

	const params = splitMessage.slice(2, splitMessage.length);
	const expectedParamCount = command.syntax.split(/ +/).length - 1;

	let finalisedParams;
	if (params.length > expectedParamCount)
		finalisedParams = params.slice(0, expectedParamCount - 1).concat([params.slice(expectedParamCount - 1, params.length).join(" ")]);
	else
		finalisedParams = params;

	return { command, commandProp, params: finalisedParams, expectedParamCount };
}

function createHelpEmbed(name, commands, userIsAdmin) {
	const commandsArr = Object.keys(commands).map(x => commands[x]).filter(x => userIsAdmin || !x.admin);

	const embed = new Discord.RichEmbed().setTitle(`__Help__ for ${(ParentPackageJSON.name + "").replace("discord-bot-", "")}`);

	commandsArr.forEach(command => {
		embed.addField(command.command, `${command.description}\n**Usage:** *${name} ${command.syntax}*${userIsAdmin && command.admin ? "\n***Admin only***" : ""}`);
	});

	embed.addField("__Need more help?__", `[Visit my website](${Config.website}) or [Join my Discord](${Config.discordInvite})`, true);

	return { embed };
}

module.exports = {
	handleDirectMessage,
	handleTextMessage
};