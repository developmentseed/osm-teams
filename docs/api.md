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

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | oath 2.0 client | object |

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
| 400 | error getting list of teams |

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
