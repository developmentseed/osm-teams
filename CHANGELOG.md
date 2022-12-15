# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [v2.0.0] - 2022-11-22

### Added

- Middleware to catch errors consistently with Boom module
- Cypress configuration
- Authentication with next-auth
### Changed

- Upgraded Next.js to v13
- Upgraded Node.js to v18
- ESLint rules
- Make table rows slightly more compact #291
- Use Next.js default port instead of `:8989`

### Fixed

- Scroll bar
- Reinstate API docs with `next-swagger-doc`

### Breaking

- Hydra configuration is temporarily broken, meaning it is not possible to create new clients