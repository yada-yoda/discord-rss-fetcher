# Changelog

## v1.1.2.1

### Fixed

- Fixed reconnect timer being set to 0 sometimes

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
