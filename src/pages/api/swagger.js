import { withSwagger } from 'next-swagger-doc'
import nextSwaggerDocSpec from '../../../next-swagger-doc.json'

/**
 * This file includes Swagger configuration and documentation YAML from OSM
 * Teams version 1.
 *
 * Ideally we should move swagger docs of API routes to files in /src/pages/api
 * and schemas docs to /src/models as it is better to keep documentation closer
 * to implementation. If you are implementing or refactoring a route/model,
 * please consider to not keep documentation in this file.
 */

/**
 * @swagger
 *
 * tags:
 *   - name: teams
 *     description: Teams
 *   - name: organizations
 *     description: Organizations
 *   - name: clients
 *     description: Clients
 *
 * components:
 *   schemas:
 *     Pagination:
 *       type: object
 *       properties:
 *         total:
 *           description: total number of records
 *           example: 55
 *           format: int64
 *           type: integer
 *         perPage:
 *           description: number of records per page
 *           example: 10
 *           format: int64
 *           type: integer
 *         lastPage:
 *           description: last page index
 *           example: 6
 *           format: int64
 *           type: integer
 *         currentPage:
 *           description: last page index
 *           example: 2
 *           format: int64
 *           type: integer
 *         from:
 *           description: index of first item in the page
 *           example: 11
 *           format: int64
 *           type: integer
 *         to:
 *           description: index of last item in the page
 *           example: 20
 *           format: int64
 *           type: integer
 *     Team:
 *       properties:
 *         id:
 *           type: integer
 *           format: int64
 *           description: unique id of the team
 *         name:
 *           type: string
 *           description: name of the team
 *         hashtag:
 *           type: string
 *           description: hashtag representing the team
 *         bio:
 *           type: string
 *           description: description of the team
 *         privacy:
 *           type: string
 *           enum: [private, public]
 *           description: if `private`, team details/members are not shown in ui unless user is a member of the team
 *         require_join_request:
 *           type: boolean
 *           description: if true, this team requires potential new members to request access
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: the timestamp of the time and date the team was created
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: the timestamp of the time and date the team was last updated
 *         location:
 *           type: string
 *           description: geojson point
 *         editing_policy:
 *           type: string
 *           format: uri
 *           description: link to organized editing policy of the team
 *     TeamMember:
 *       properties:
 *         id:
 *           type: string
 *           description: OSM id of user
 *         name:
 *           type: string
 *           description: OSM username
 *     TeamMemberList:
 *       type: array
 *       items:
 *         $ref: '#/components/schemas/TeamMember'
 *     TeamModerator:
 *       properties:
 *         id:
 *           type: integer
 *           description: unique id representing the team moderator relation
 *         osm_id:
 *           type: integer
 *           description: OSM id of user
 *         team_id:
 *           type: integer
 *           description: unique id of the team
 *     TeamModeratorList:
 *       type: array
 *       items:
 *         $ref: '#/components/schemas/TeamModerator'
 *     TeamFullDetail:
 *       allOf:
 *         - $ref: '#/components/schemas/Team'
 *         - type: object
 *           properties:
 *             members:
 *               $ref: '#/components/schemas/TeamModeratorList'
 *             moderators:
 *               $ref: '#/components/schemas/TeamModeratorList'
 *     Organization:
 *       properties:
 *         id:
 *           type: integer
 *           format: int64
 *           description: unique id of the organization
 *         name:
 *           type: string
 *           description: name of the organization
 *         description:
 *           type: string
 *           description: description of the organization
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: the timestamp of the time and date the organization was created
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: the timestamp of the time and date the organization was last updated
 *     OrganizationOwner:
 *       properties:
 *         id:
 *           type: integer
 *           description: unique id representing the organization owner relation
 *         osm_id:
 *           type: integer
 *           description: OSM id of user
 *         organization_id:
 *           type: integer
 *           description: unique id of the organization
 *     OrganizationManager:
 *       properties:
 *         id:
 *           type: integer
 *           description: unique id representing the organization manager relation
 *         osm_id:
 *           type: integer
 *           description: OSM id of user
 *         organization_id:
 *           type: integer
 *           description: unique id of the organization
 *     OrganizationTeam:
 *       properties:
 *         id:
 *           type: integer
 *           description: unique id representing the organization team relation
 *         team_id:
 *           type: integer
 *           description: id of team
 *         organization_id:
 *           type: integer
 *           description: unique id of the organization
 *     OrganizationOwnerList:
 *       type: array
 *       items:
 *         $ref: '#/components/schemas/OrganizationOwner'
 *     OrganizationManagerList:
 *       type: array
 *       items:
 *         $ref: '#/components/schemas/OrganizationManager'
 *     OrganizationFullDetail:
 *       allOf:
 *         - $ref: '#/components/schemas/Organization'
 *         - type: object
 *           properties:
 *             members:
 *               $ref: '#/components/schemas/OrganizationOwnerList'
 *             moderators:
 *               $ref: '#/components/schemas/OrganizationManagerList'
 *     Client:
 *       properties:
 *         client_id:
 *           type: string
 *           description: unique id of the client application
 *         client_name:
 *           type: string
 *           description: human-readable name presented to a user during authorization
 *         redirect_uris:
 *           type: array
 *           description: an array of allowed redirect urls for the client
 *           items:
 *             type: string
 *             format: uri
 *         grant_types:
 *           type: array
 *           description: an array of grant types the client is allowed to use
 *           items:
 *             type: string
 *         response_types:
 *           type: array
 *           description: an array of the OAuth 2.0 response type strings that the client can use at the authorization endpoint
 *           items:
 *             type: string
 *         scope:
 *           type: string
 *           description: a string containing a space-separated list of scope values
 *         audience:
 *           type: array
 *           description: a list defining the audiences this client is allowed to request tokens for
 *           items:
 *             type: string
 *         owner:
 *           type: string
 *           description: id of the user that created the client
 *         policy_uri:
 *           type: string
 *           description: a URL string that points to a human-readable privacy policy document that describes how the client collects, uses, retains, and discloses personal data
 *           format: uri
 *         allowed_cors_origins:
 *           type: array
 *           description: one or more URLs that are allowed to make CORS requests to the /oauth/token endpoint
 *           items:
 *             type: string
 *             format: uri
 *         tos_uri:
 *           type: string
 *           description: a URL string that points to a human-readable terms of service document for the client that describes a contractual relationship between the end-user and the client that the end-user accepts when authorizing the client
 *           format: uri
 *         client_uri:
 *           type: string
 *           description: a URL string of a web page providing information about the client
 *           format: uri
 *         logo_uri:
 *           type: string
 *           description: a URL string for the client logo
 *           format: uri
 *         contacts:
 *           type: array
 *           description: array of strings representing ways to contact people responsible for this client, typically email addresses
 *         client_secret_expires_at:
 *           type: integer
 *           description: an integer holding the time at which the client secret will expire or 0 if it will not expire
 *           format: int64
 *         subject_type:
 *           type: string
 *           description: the subject type requested for responses to the client
 *           enum: [pairwise, public]
 *         token_endpoint_auth_method:
 *           type: string
 *           description: client authentication method for the token endpoint
 *           enum: [client_secret_post, client_secret_basic, private_key_jwt, none]
 *         userinfo_signed_response_alg:
 *           type: string
 *           description: jws algorithm used for signing user info response. if omitted, the response is a UTF-8 encoded JSON object using the application/json content-type
 *         created_at:
 *           type: string
 *           description: the timestamp of the time and date the client was created
 *           format: date-time
 *         updated_at:
 *           type: string
 *           description: the timestamp of the time and date the client was last updated
 *           format: date-time
 *     ResponseError:
 *       properties:
 *         statusCode:
 *           type: integer
 *         error:
 *           type: string
 *         message:
 *           type: string
 *   parameters:
 *     ClientId:
 *       name: id
 *       in: path
 *       description: client id
 *       required: true
 *       schema:
 *         type: integer
 *         format: int64
 *     TeamId:
 *       name: id
 *       in: path
 *       description: team id
 *       required: true
 *       schema:
 *         type: integer
 *         format: int64
 *     OrgId:
 *       name: id
 *       in: path
 *       description: organization id
 *       required: true
 *       schema:
 *         type: integer
 *         format: int64
 *     OsmId:
 *       name: osmId
 *       in: path
 *       description: osm id
 *       required: true
 *       schema:
 *         type: integer
 *         format: int64
 *
 * paths:
 *   /clients:
 *     get:
 *       summary: list of clients
 *       tags:
 *         - clients
 *       responses:
 *         '200':
 *           description: A JSON array of client objects
 *           content:
 *             application/json:
 *               schema:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Client'
 *     post:
 *       summary: create a client
 *       tags:
 *         - clients
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Client'
 *       responses:
 *         '200':
 *           description: oath 2.0 client
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   client:
 *                     $ref: '#/components/schemas/Client'
 *   /clients/{id}:
 *     parameters:
 *       - $ref: '#/components/parameters/ClientId'
 *     delete:
 *       summary: delete a client
 *       tags:
 *         - clients
 *       responses:
 *         '200':
 *           description: client is deleted
 *   /teams:
 *     get:
 *       summary: list of teams
 *       tags:
 *         - teams
 *       responses:
 *         '200':
 *           description: A JSON array of team objects
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/ArrayOfTeams'
 *         '400':
 *           description: error getting list of teams
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/Team'
 *     post:
 *       summary: create a team
 *       tags:
 *         - teams
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Team'
 *       responses:
 *         '200':
 *           description: team
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/Team'
 *   /teams/{id}:
 *     parameters:
 *       - $ref: '#/components/parameters/TeamId'
 *     get:
 *       summary: get a team
 *       tags:
 *         - teams
 *       responses:
 *         '200':
 *           description: team retrieved
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/TeamFullDetail'
 *         '400':
 *           description: error getting list of teams
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/ResponseError'
 *     put:
 *       summary: update a team
 *       tags:
 *         - teams
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Team'
 *       responses:
 *         '200':
 *           description: team updated
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/TeamFullDetail'
 *         '400':
 *           description: error updating team
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/ResponseError'
 *     delete:
 *       summary: delete a team
 *       tags:
 *         - teams
 *       responses:
 *         '200':
 *           description: team is deleted
 *         '400':
 *           description: error deleting team
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/ResponseError'
 *   /teams/add/{id}/{osmId}:
 *     parameters:
 *       - $ref: '#/components/parameters/TeamId'
 *       - $ref: '#/components/parameters/OsmId'
 *     put:
 *       summary: add a team member to a team
 *       tags:
 *         - teams
 *       responses:
 *         '200':
 *           description: team member is added
 *         '400':
 *           description: error adding member to team
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/ResponseError'
 *   /teams/remove/{id}/{osmId}:
 *     parameters:
 *       - $ref: '#/components/parameters/TeamId'
 *       - $ref: '#/components/parameters/OsmId'
 *     put:
 *       summary: remove a team member from a team
 *       tags:
 *         - teams
 *       responses:
 *         '200':
 *           description: team member is removed
 *         '400':
 *           description: error removing member to team
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/ResponseError'
 *   /teams/{id}/members:
 *     parameters:
 *       - $ref: '#/components/parameters/TeamId'
 *     patch:
 *       summary: add and remove team members from a team
 *       tags:
 *         - teams
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 add:
 *                   type: array
 *                   items:
 *                     type: integer
 *                     description: osm id
 *                 remove:
 *                   type: array
 *                   items:
 *                     type: integer
 *                     description: osm id
 *       responses:
 *         '200':
 *           description: team members are added/removed
 *         '400':
 *           description: error updating team members
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/ResponseError'
 *   /teams/{id}/assignModerator/{osmId}:
 *     parameters:
 *       - $ref: '#/components/parameters/TeamId'
 *       - $ref: '#/components/parameters/OsmId'
 *     put:
 *       summary: >
 *         Assign/Promote a member to be moderator of a team. More than one
 *         moderator may exist concurrently. Moderators are listed in the
 *         TeamModeratorList schema.
 *       tags:
 *         - teams
 *       responses:
 *         '200':
 *           description: member was promoted to moderator
 *         '400':
 *           description: error updating moderator relation
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/ResponseError'
 *   /teams/{id}/removeModerator/{osmId}:
 *     parameters:
 *       - $ref: '#/components/parameters/TeamId'
 *       - $ref: '#/components/parameters/OsmId'
 *     put:
 *       summary: >
 *         Remove/Demote a moderator of a team. At least one moderator must exist
 *         for a team. Moderators are listed in the TeamModeratorList schema.
 *       tags:
 *         - teams
 *       responses:
 *         '200':
 *           description: member was demoted from moderator
 *         '400':
 *           description: error updating moderator relation
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/ResponseError'
 *   /organizations:
 *     post:
 *       summary: create an organization
 *       tags:
 *         - organizations
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Organization'
 *       responses:
 *         '200':
 *           description: team
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/Organization'
 *   /organizations/{id}:
 *     parameters:
 *       - $ref: '#/components/parameters/OrgId'
 *     get:
 *       summary: get an organization
 *       tags:
 *         - organizations
 *       responses:
 *         '200':
 *           description: organization retrieved
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/OrganizationFullDetail'
 *         '400':
 *           description: error getting list of organizations
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/ResponseError'
 *     put:
 *       summary: update an organization
 *       tags:
 *         - organizations
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Organization'
 *       responses:
 *         '200':
 *           description: team updated
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/Organization'
 *         '400':
 *           description: error updating organization
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/ResponseError'
 *     delete:
 *       summary: delete an organization
 *       tags:
 *         - organizations
 *       responses:
 *         '200':
 *           description: organization is deleted
 *         '400':
 *           description: error deleting organization
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/ResponseError'
 *   /organizations/{id}/addOwner/{osmId}:
 *     parameters:
 *       - $ref: '#/components/parameters/OrgId'
 *       - $ref: '#/components/parameters/OsmId'
 *     put:
 *       summary: >
 *         Assign/Promote a user to be an owner of an organization. More than one
 *         owner may exist concurrently. Owners can manage organizations of an organization.
 *       tags:
 *         - organizations
 *       responses:
 *         '200':
 *           description: user is promoted to owner of organization
 *         '400':
 *           description: error updating owner relation
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/ResponseError'
 *   /organizations/{id}/removeOwner/{osmId}:
 *     parameters:
 *       - $ref: '#/components/parameters/OrgId'
 *       - $ref: '#/components/parameters/OsmId'
 *     put:
 *       summary: >
 *         Remove/Demote an owner of an organization. At least one owner
 *         must remain in the organization.
 *       tags:
 *         - organizations
 *       responses:
 *         '200':
 *           description: user is demoted from owner
 *         '400':
 *           description: error updating owner relation
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/ResponseError'
 *   /organizations/{id}/addManager/{osmId}:
 *     parameters:
 *       - $ref: '#/components/parameters/OrgId'
 *       - $ref: '#/components/parameters/OsmId'
 *     put:
 *       summary: >
 *         Assign/Promote a user to be a manager of an organization. More than one
 *         manager may exist concurrently. Managers can create organizations for an organization
 *         but cannot update the organization.
 *       tags:
 *         - organizations
 *       responses:
 *         '200':
 *           description: user is promoted to manager of organization
 *         '400':
 *           description: error updating owner relation
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/ResponseError'
 *   /organizations/{id}/removeManager/{osmId}:
 *     parameters:
 *       - $ref: '#/components/parameters/OrgId'
 *       - $ref: '#/components/parameters/OsmId'
 *     put:
 *       summary: >
 *         Remove/Demote manager of an organization. An org can have no managers.
 *       tags:
 *         - organizations
 *       responses:
 *         '200':
 *           description: user is demoted from manager of organization
 *         '400':
 *           description: error updating owner relation
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/ResponseError'
 *
 */

const swaggerHandler = withSwagger(nextSwaggerDocSpec)
export default swaggerHandler()
