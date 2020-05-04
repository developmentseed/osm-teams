#!/usr/bin/env bash
set -e

#
# manage osm-teams organization managers via psql.
#

show_help() {
  cat << __HELP__
  owners.sh

  add or remove managers from osm-teams

  -o | --org-id : organization id to operate on
  -u | --user-id : osm/mapedit user id to add/remove
  -r | --remove : remove the user from managers list

  example:

  ./managers.sh --user-id 0912311 --org-id 1
  ./managers.sh --remove --user-id 0912311 --org-id 1

__HELP__
}

die() {
    printf '%s\n' "$1" >&2
    exit 1
}


if [ -z "$DSN" ]; then
  die "error: DSN for postgreql database is missing"
fi

uid=
oid=
remove=

while :; do
    case $1 in
        -h|-\?|--help)
          show_help
          exit
          ;;
        -u|--user-id)
          if [ "$2" ]; then
              uid=$2
              shift
          else
              die 'error: "--user-id" requires a non-empty option argument.'
          fi
          ;;
        -o|--org-id)
          if [ "$2" ]; then
            oid=$2
            shift
          else
              die 'error: "--org-id" requires a non-empty option argument.'
          fi
          ;;
        -r|--remove)
            remove=1
            ;;
        --)
            shift
            break
            ;;
        -?*)
            printf 'warn: Unknown option (ignored): %s\n' "$1" >&2
            ;;
        *)               # Default case: No more options, so break out of the loop.
            break
    esac
    shift
done

if [ -z "$uid" ]; then
    die "missing --user-id of osm/mapedit user to add/remove"
fi

if [ -z "$oid" ]; then
    die "missing --org-id of organization to modify"
fi

if [ -z "$remove" ]; then
  psql $DSN --command "insert into organization_manager (organization_id, osm_id) values ($oid, $uid)"
else
  psql $DSN --command "delete from organization_manager where organization_id = $oid and osm_id = $uid"
fi

psql $DSN --command "select * from organization_manager"
