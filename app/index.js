//acts as on ready function
module.exports = (client) => {
	client.on("message", message => message.reply("Hello!"));
	//check messages in channel for links posted since last online
	
	//set up an interval to check all the feeds

	//set up an on message handler to detect when links are posted
};