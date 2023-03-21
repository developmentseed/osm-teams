# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [v2.2.0] - 2023-03-21

### Changed

- [Update table, page and layout styles](https://github.com/developmentseed/osm-teams/pull/391)
- [Add back links](https://github.com/developmentseed/osm-teams/pull/392)
- [Update next-auth](https://github.com/developmentseed/osm-teams/pull/407)
- [Add Chakra](https://github.com/developmentseed/osm-teams/pull/411)
- [Add about page, fix nextlinks](https://github.com/developmentseed/osm-teams/pull/413)
- [Add/form styles](https://github.com/developmentseed/osm-teams/pull/416)
- [Create join link component](https://github.com/developmentseed/osm-teams/pull/418)
- [Add text grid for Team Details](https://github.com/developmentseed/osm-teams/pull/421)
- [Enhance profile and team edit forms](https://github.com/developmentseed/osm-teams/pull/423)
- [Replace profile url and name with dashboard](https://github.com/developmentseed/osm-teams/pull/426)
- [Add error boundary and update 404](https://github.com/developmentseed/osm-teams/pull/427)
- [Redirect invite accepted to team page on success](https://github.com/developmentseed/osm-teams/pull/414)
- [Enhance map display and add org teams map](https://github.com/developmentseed/osm-teams/pull/424)
- [Enhance/table styles](https://github.com/developmentseed/osm-teams/pull/420)
- [Display organization badges on Team page](https://github.com/developmentseed/osm-teams/pull/415)

### Fixed

- [Return 401 error if token is invalid](https://github.com/developmentseed/osm-teams/pull/393)
- [create code guards when org or user are undefined](https://github.com/developmentseed/osm-teams/pull/396)
- [Return only public teams at /api/teams](https://github.com/developmentseed/osm-teams/pull/402)
- [Make 3rd party app links environment dependent](https://github.com/developmentseed/osm-teams/pull/409)
- [Use correct input type for edit team attributes](https://github.com/developmentseed/osm-teams/pull/422)
- [Fix required profile attribute checkbox](https://github.com/developmentseed/osm-teams/pull/431)

**Full Changelog**: https://github.com/developmentseed/osm-teams/compare/v2.1.0...v2.2.0

## [v2.1.1] - 2023-01-26

### Fixed

- [Unauthenticated request returns all team information](https://github.com/developmentseed/osm-teams/pull/#398)

**Full Changelog**: <https://github.com/developmentseed/osm-teams/compare/v2.1.0...v2.1.1>

## [v2.1.0] - 2023-01-19

Hydra configuration now is restored, API can be used similarly to before v2. Get an access token or create a
client on <https://auth.mapping.team> and use these tokens to create API requests to <https://mapping.team>

### Added

- [Add pagination to organization teams table](https://github.com/developmentseed/osm-teams/pull/342)
- [Add pagination to profile page](https://github.com/developmentseed/osm-teams/pull/349)
- [Add pagination to organization page](https://github.com/developmentseed/osm-teams/pull/353)
- [Add search to members and staff tables in organization page](https://github.com/developmentseed/osm-teams/pull/367)
- [Add sort, pagination and search to members list at team page](https://github.com/developmentseed/osm-teams/pull/370)
- [Adds search and sort to org teams, members, staff tables](https://github.com/developmentseed/osm-teams/pull/375)
- [Add badges to org members table](https://github.com/developmentseed/osm-teams/pull/384)
- [Add username table](https://github.com/developmentseed/osm-teams/pull/347)
- [Add external links buttons to the team view](https://github.com/developmentseed/osm-teams/pull/378)
- [Add backlinks](https://github.com/developmentseed/osm-teams/pull/392)

### Changed

- [Run checks on develop](https://github.com/developmentseed/osm-teams/pull/366)
- [Remove express server from v1](https://github.com/developmentseed/osm-teams/pull/359)
- [Update map bounds checkbox](https://github.com/developmentseed/osm-teams/pull/374)
- [Add role label to users and members table](https://github.com/developmentseed/osm-teams/pull/389)
- [Update pagination button styles](https://github.com/developmentseed/osm-teams/pull/377)
- [Limit badges column to 3 badges in users table](https://github.com/developmentseed/osm-teams/pull/386)
- [Update table, page, layout styles](https://github.com/developmentseed/osm-teams/pull/391)

### Fixed

- [Fix API docs](https://github.com/developmentseed/osm-teams/pull/346)
- [Fix auth setup instructions](https://github.com/developmentseed/osm-teams/pull/348)
- [Make sure user ids are integers when resolving member names](https://github.com/developmentseed/osm-teams/pull/356)
- [Use logger helper consistently](https://github.com/developmentseed/osm-teams/pull/357)
- [Fix data fetching on badge page](https://github.com/developmentseed/osm-teams/pull/360)
- [Add display name to welcome page](https://github.com/developmentseed/osm-teams/pull/369)
- [Fix token Validation for API calls](https://github.com/developmentseed/osm-teams/pull/372)
- [Fix API Docs URL link](https://github.com/developmentseed/osm-teams/pull/380)
- [Allow CORS in API](https://github.com/developmentseed/osm-teams/pull/381)
- [Return 401 error if token is invalid](https://github.com/developmentseed/osm-teams/pull/393)
- [Code guards when org/user are undefined](https://github.com/developmentseed/osm-teams/pull/396)

**Full Changelog**: <https://github.com/developmentseed/osm-teams/compare/v2.0.0...v2.1.0>

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
