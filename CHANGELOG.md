# Changelog

## v1.4.0

## Added

- Support for posting links from multiple feeds
- Tagging of separate roles for each feed being checked

## Updated

- Updated bot connection code to use my discord-bot-wrapper

## Removed

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
