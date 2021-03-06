# OSM Teams
Teams for OpenStreetMap! [Log in to try out requests other than GET](/)

## Version: 0.0.0

### /clients

#### GET
##### Summary:

list of clients

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | A JSON array of client objects |

#### POST
##### Summary:

create a client

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | oath 2.0 client |

### /clients/{id}

#### DELETE
##### Summary:

delete a client

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
|  |  |  | No | [ClientId](#clientid) |

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | client is deleted |

### /teams

#### GET
##### Summary:

list of teams

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | A JSON array of team objects |
| 400 | error getting list of teams |

#### POST
##### Summary:

create a team

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | team |

### /teams/{id}

#### GET
##### Summary:

get a team

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
|  |  |  | No | [TeamId](#teamid) |

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | team retrieved |
| 400 | error getting list of teams |

#### PUT
##### Summary:

update a team

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
|  |  |  | No | [TeamId](#teamid) |

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | team updated |
| 400 | error updating team |

#### DELETE
##### Summary:

delete a team

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
|  |  |  | No | [TeamId](#teamid) |

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | team is deleted |
| 400 | error deleting team |

### /teams/add/{id}/{osmId}

#### PUT
##### Summary:

add a team member to a team

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
|  |  |  | No | [TeamId](#teamid) |
|  |  |  | No | [OsmId](#osmid) |

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | team member is added |
| 400 | error adding member to team |

### /teams/remove/{id}/{osmId}

#### PUT
##### Summary:

remove a team member from a team

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
|  |  |  | No | [TeamId](#teamid) |
|  |  |  | No | [OsmId](#osmid) |

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | team member is removed |
| 400 | error removing member to team |

### /teams/{id}/members

#### PATCH
##### Summary:

add and remove team members from a team

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
|  |  |  | No | [TeamId](#teamid) |

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | team members are added/removed |
| 400 | error updating team members |

### /teams/{id}/assignModerator/{osmId}

#### PUT
##### Summary:

Assign/Promote a member to be moderator of a team. More than one moderator may exist concurrently. Moderators are listed in the TeamModeratorList schema.


##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
|  |  |  | No | [TeamId](#teamid) |
|  |  |  | No | [OsmId](#osmid) |

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | member was promoted to moderator |
| 400 | error updating moderator relation |

### /teams/{id}/removeModerator/{osmId}

#### PUT
##### Summary:

Remove/Demote a moderator of a team. At least one moderator must exist for a team. Moderators are listed in the TeamModeratorList schema.


##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
|  |  |  | No | [TeamId](#teamid) |
|  |  |  | No | [OsmId](#osmid) |

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | member was demoted from moderator |
| 400 | error updating moderator relation |

### /organizations

#### POST
##### Summary:

create an organization

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | team |

### /organizations/{id}

#### GET
##### Summary:

get an organization

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
|  |  |  | No | [OrgId](#orgid) |

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | organization retrieved |
| 400 | error getting list of organizations |

#### PUT
##### Summary:

update an organization

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
|  |  |  | No | [OrgId](#orgid) |

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | team updated |
| 400 | error updating organization |

#### DELETE
##### Summary:

delete an organization

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
|  |  |  | No | [OrgId](#orgid) |

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | organization is deleted |
| 400 | error deleting organization |

### /organizations/{id}/addOwner/{osmId}

#### PUT
##### Summary:

Assign/Promote a user to be an owner of an organization. More than one owner may exist concurrently. Owners can manage organizations of an organization.


##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
|  |  |  | No | [OrgId](#orgid) |
|  |  |  | No | [OsmId](#osmid) |

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | user is promoted to owner of organization |
| 400 | error updating owner relation |

### /organizations/{id}/removeOwner/{osmId}

#### PUT
##### Summary:

Remove/Demote an owner of an organization. At least one owner must remain in the organization.


##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
|  |  |  | No | [OrgId](#orgid) |
|  |  |  | No | [OsmId](#osmid) |

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | user is demoted from owner |
| 400 | error updating owner relation |

### /organizations/{id}/addManager/{osmId}

#### PUT
##### Summary:

Assign/Promote a user to be a manager of an organization. More than one manager may exist concurrently. Managers can create organizations for an organization but cannot update the organization.


##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
|  |  |  | No | [OrgId](#orgid) |
|  |  |  | No | [OsmId](#osmid) |

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | user is promoted to manager of organization |
| 400 | error updating owner relation |

### /organizations/{id}/removeManager/{osmId}

#### PUT
##### Summary:

Remove/Demote manager of an organization. An org can have no managers.


##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
|  |  |  | No | [OrgId](#orgid) |
|  |  |  | No | [OsmId](#osmid) |

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | user is demoted from manager of organization |
| 400 | error updating owner relation |

### /organizations/{id}/teams

#### POST
##### Summary:

Add a team to this organization. Only owners and managers can add new teams.


##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
|  |  |  | No | [OrgId](#orgid) |

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | team was added successfully |
| 400 | error creating team for organization |

#### GET
##### Summary:

Get a list of teams for the specified organization


##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
|  |  |  | No | [OrgId](#orgid) |

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | A JSON array of team objects |
| 400 | error getting list of teams |
