# Changelog

## Unreleased

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
