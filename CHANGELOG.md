# Changelog
## v4.0.0
Version 4.0 is a complete re-write of the bot using TypeScript and built on top of my [disharmony library](https://github.com/benji7425/disharmony).
This changelog entry does not assume knowledge of v3.5 or prior, and so list additions as if this is a new project.

### Added
- Integration with [disharmony](https://github.com/benji7425/disharmony) [v0.8.0](https://www.npmjs.com/package/disharmony/v/0.8.0)
- Command *add-feed* to add RSS feed
- Command *view-feeds* to view configured feeds
- Command *remove-feed* to remove configured feed
- Integration with [rss-parser](https://www.npmjs.com/package/rss-parser) package for RSS parsing
- Feed monitoring and posting, with optional role mentioning
- Formatting of article content for Discord post
    - HTML renderered as text if necessary
- Linting with TSLint