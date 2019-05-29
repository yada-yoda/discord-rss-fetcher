# Changelog
## v4.0.0-b5
### Updated
- Article content length to a more reasonable value

### Fixed
- Article links having Discord link preview suppressed due to being emboldened
- Command 'remove-feed' not removing feeds
- Command 'remove-feed' sometimes duplicating feeds

## v4.0.0-b4
### Updated
- Module disharmony to v0.8.3

### Fixed
- Field `Guild.feeds` not correctly creating default value when empty

## v4.0.0-b3
### Updated
- Module disharmony to v0.8.2

## v4.0.0-b2
### Updated
- Module disharmony to v0.8.1

## v4.0.0-b1
Version 4.0 is a complete re-write of the bot using TypeScript and built on top of my [disharmony library](https://github.com/benji7425/disharmony).
This changelog entry does not assume knowledge of v3.5 or prior, and so list additions as if this is a new project.

### Added
- Integration with [disharmony](https://github.com/benji7425/disharmony) [v0.8.0](https://www.npmjs.com/package/disharmony/v/0.8.0)
- Command *add-feed* to add RSS feed
- Command *view-feeds* to view configured feeds
- Command *remove-feed* to remove configured feed
- Integration with [rss-parser](https://www.npmjs.com/package/rss-parser) package for RSS parsing
- Feed monitoring and posting, with optional role mentioning
- Linting with TSLint

## v1.0-v3.5
Versions v1.0 through v3.5 are considered "legacy", as most of the library was re-written for v4.0.  
You can view the legacy branch [here](https://github.com/benji7425/discord-rss-fetcher/tree/legacy)