const Command = require("../command.js");

module.exports = new Command({
    name: "reset",
    description: "Reset all data for this Discord server. WARNING: YOU WILL LOSE ALL YOUR SETTINGS!",
    syntax: "reset",
    admin: false,
    invoke
});

function invoke({ guildData }) {
    return new Promise((resolve, reject) => {
        guildData
            .delete()
            .then(() => resolve("Data for this server successfully deleted"))
            .catch(() => reject("Error deleting data for this server"));
    });
}