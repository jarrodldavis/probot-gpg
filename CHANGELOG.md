# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/) and this project adheres to [Semantic Versioning](http://semver.org/).

## [0.2.0] - 2017-06-21
### Changed
- Update `probot` to 0.7.1
- Update `strip-ansi` to 4.0.0
- Update references to "GitHub Integration" to be "GitHub App"
- Update this changelog's title to use "Changelog" instead of "Change Log"

## [0.1.0] - 2017-05-25
### Added
- Initial release!
- Webhook event handler for Pull Requests that checks that all commits in the PR have a verified GPG signature
- Unit tests for each module under `/lib`
- A single integration test for the Happy Path (every commit has a verified signature)
- This change log

[0.1.0]: https://github.com/jarrodldavis/probot-gpg/compare/v0.0.0...v0.1.0
[0.2.0]: https://github.com/jarrodldavis/probot-gpg/compare/v0.1.0...v0.2.0
