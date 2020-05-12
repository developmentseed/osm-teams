# Managing organizations

For the following commands, the shell environment variable `DSN` should be set to the osm-teams database connection string. 

## Creating an organization
```
  organizations.sh

  add or remove organizations from osm-teams

  -n | --name : organization name to add/remove
  -d | --description : organization description to add (optional)
  -r | --remove : remove the organization (requires --name)

  example:

  ./organizations.sh --name "my org" --description "foo"
  ./organizations.sh --remove --name "my org"
```

## Adding / removing owners
```
  owners.sh

  add or remove owners from osm-teams

  -o | --org-id : organization id to operate on
  -u | --user-id : osm/mapedit user id to add/remove
  -r | --remove : remove the user from owners list

  example:

  ./owners.sh --user-id 0912311 --org-id 1
  ./owners.sh --remove --user-id 0912311 --org-id 1
```

## Adding / removing managers
```
  managers.sh

  add or remove managers from osm-teams

  -o | --org-id : organization id to operate on
  -u | --user-id : osm/mapedit user id to add/remove
  -r | --remove : remove the user from managers list

  example:

  ./managers.sh --user-id 0912311 --org-id 1
  ./managers.sh --remove --user-id 0912311 --org-id 1
```
