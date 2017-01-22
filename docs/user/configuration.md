# Configuration

| parameter          | description                                                                                                                             |
|--------------------|-----------------------------------------------------------------------------------------------------------------------------------------|
| feedUrl            | the RSS feed to check                                                                                                                   |
| channelID          | report all the cached URLs                                                                                                              |
| serverID           | id of the server the bot is installed on - require to use subscriptions                                                                 |
| pollingInterval    | interval in ms to check the RSS feed                                                                                                    |
| numLinksToCache    | number of posted links to cache and check against before posting - turn this up if users post a lot of links in the channel             |
| messageDeleteDelay | time in ms to leave response messages before deleting (eg "You have successfully subscribed")                                           |
| youtubeMode        | whether or not to convert YouTube links to their short url - recommended if you are pulling links from a YouTube channel feed           |
| allowSubscriptions | whether or not to have the bot mention a role when it posts a link                                                                      |
| subscribersRoleID  | the ID of the role to mention when posting a link - you can find this by typing \@role in discord and copying out just the numeric part |
| developers         | array of developer IDs - add a new one by putting a comma at the end of the one above and putting the ID in double quotes               |


## How to find IDs

- Make sure developer mode is turned on in discord
    - User Settings > Appearance > Developer Mode

| id                         | how to find                                   |
|----------------------------|-----------------------------------------------|
| channelID                  | right click on the channel > copy ID          |
| serverID                   | right click on the server name > copy ID      |
| subscribersRoleID          | type \@role in discord, copy the numeric part |
| user ID (to add developer) | right click on user > copy ID                 |

## Note about subsriptions

For subscriptions to work the bot needs the "Manage roles" permission, and needs to be in a role *higher than* the subscribers role