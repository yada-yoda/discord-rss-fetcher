# Changelog
## v3.5.2
### Added
- Added bot name to version command
- Added stats command

### Fixed
- Fixed reset command not being admin only

## v3.5.1
### Fixed
- Fixed reset command not working

### Updated
- Removed deletion of data for removed guilds on startup, as Discord outages can wrongly report the bot as being removed

## v3.5.0
### Added
- MongoDB support
- Reset command to clear all data for a guild

### Updated
- Removed automatic daily restart (I think it shouldn't be needed now that MongoDB support is working)

### Fixed
- Guild data being deleted on a Discord outage

## v3.4.0
### Added
- Added automatic daily restart

### Updated
- Disabled a few unused websocket events
- Update database compaction to be more frequent

### Fixed
- Fixed YouTube feeds not updating

## v3.3.0
### Updated
- Updated RSS parser to now use [rss-parser](https://www.npmjs.com/package/rss-parser) module to increase compatibility with feeds
- Updated RSS entry caching to exclude 'www.' prefix to avoid certain mis-caches

## v3.2.2
### Fixed
- Fixed a couple of edge case errors

## v3.2.1
### Fixed
- Fixed memory leak due to unconfigured discord.js caching

## v3.2.0
### Updated
- Updated data storage to use a NeDB database rather than a json file
- Updated feed checking interval to check one guild every 10 seconds (this may slow down the time it takes to post, but will improve performance)
- Improve stability of feed checking
- Tidy up some console spam
### Fixed
- Fix bot crash if feed article contains link with invalid host name
- Temporary fix for bot crash if used with a feed without links in the articles (didn't realise this was possible...)
- Attempt fix for issues caused by every feed of every guild being checked at the same time

## v3.1.3
### Added
- Add rudimentary pagination for viewing feeds when there are more than 10

### Fixed
- Fix articles not posting if contents too long for a single discord message

## v3.1.2
### Fixed
- Deleted channels with feeds sending the bot into a reconnect loop

## v3.1.1
### Fixed
- Empty RSS feed crash

## v3.1.0
### Added
- RSS element content is now included in the post the bot makes when there is a new feed
- Warning message after setup command if supplied URL does not return valid RSS
- Guild join and leave messages in the console
- Removal of guild data if the bot leaves a guild

### Updated
- Route a lot of mostly irrelevant console spam to a file instead of the console
- Updated launch command to pass max-old-space-size parameter to limit memory usage

### Fixed
- Fixed syntax error when role omitted in feed setup command; it is now properly optional
- Fixed the wrong feed sometimes being removed when using the remove-feed command

## v3.0.1
### Fixed
- Fixed nicknamed bot not responding to users on android
- Fixed "playing" message including "https://" in front of site url

## v3.0.0
### Added
- Significantly more debug logging
- Fancy new @bot help command

### Updatd
- Significant back-end updates
- Commands now invoked with an @mention to the bot
- Updated error handling for Discord API errors
- Removed "Body is not RSS or ATOM" error from being console logged
	- These seem to happen quite a lot, but don't actually impair the functionality, so just cause un-necessary spam
- Removed "command not recognised" response, it caused 'fake' errors if multiple bots being run off the same token

### Fixed
- Fixed full and short youtube urls not being properly converted
- Fixed "multiple instance" issue
- Fixed a couple of occasional memory leaks

## v2.0.0-b1
### Added
- Multi-guild support
- In-chat commands for setup and configuration
	- Add a new feed
	- View a list of feeds
	- Remove an existing feed

### Updated
- Make save file configurable to allow use as a module with other bots
- Update config file structure
- Now uses discord.js instead of discord.io
- YouTube links automatically handled; no more separate "YouTube mode" config item

### Fixed
- Crash if trying to view feeds list before any feeds have been set up

## v1.4.0
### Added
- Support for posting links from multiple feeds
- Tagging of separate roles for each feed being checked

### Updated
- Updated bot connection code to use my discord-bot-wrapper

### Removed
- !logsplease command removed as the OTT logging was just being annoying

## v1.3.2
### Fixed
- Fixed list posting channel messages being ignored

## v1.3.1
### Fixed
- Developer commands can now be used from any channel or PM

## v1.3.0
### Added
- Deletion of "You have successfully subscribed" messages after a short delay (configurable)
- 'Developer' commands that can only be accessed by specified users
- !cacheList developer command to view the cached URLs

### Updated
- !logsplease is now a developer command
- Subscriptions are now done using a role
    - !subscribe and !unsibscribe add and remove the user from the role
    - !sublist command is now removed
    - The role is mentioned when the link is posted, rather than a long chain of user IDs

## v1.2.1
### Fixed
- Fixed multiple users being unsubscribed when one user unsubscribes

## v1.2.0
### Added
- Chat message/command to request a list of subscribed users
- The ability for users to 'subscribe' so they are tagged whenever a new link is posted
- Logging to a file
- Ability for user to request an upload of the logs file

### Updated
- Added basic spam reduction when logging so the same message won't get logged multiple times in a row
- Refactored a bunch of code to improve efficiency
- Updated timer logic to only ever use a single timer, and share it between posting and reconnecting

## v1.1.2
### Updated
- Updated reconnect logic to hopefully be more stable

## v1.1.1
### Added
- Reconnect timer to repeatedly try reconnect at intervals

### Updated
- Updated support for https conversion to http to hopefully be more consistent

## v1.1.0
### Added
- Added togglable YouTube mode
    - Converts full URLs to YouTube share URLs
    - Checks against both YouTube full and share URLs to ensure same video not posted twice
- New logging class to handle logging

### Updated
- Major refactor of a significant portion of the bot's code - should be easier to maintain now, but may have introduced some new bugs
- Changed expected name for bot config file to bot-config.json rather than botConfig.json

### Fixed
- New timer being created every time the bot reconnected