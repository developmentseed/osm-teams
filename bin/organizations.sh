#!/usr/bin/env bash
set -e

#
# manage osm-teams organizations via psql.
#

show_help() {
  cat << __HELP__
  organizations.sh

  add or remove organizations from osm-teams

  -n | --name : organization name to add/remove
  -d | --description : organization description to add (optional)
  -r | --remove : remove the organization (requires --name)

  example:

  ./organizations.sh --name "my org" --description "foo"
  ./organizations.sh --remove --name "my org"

__HELP__
}

die() {
    printf '%s\n' "$1" >&2
    exit 1
}


if [ -z "$DSN" ]; then
  die "error: DSN for postgreql database is missing"
fi

name=
description=
remove=

while :; do
    case $1 in
        -h|-\?|--help)
            show_help
            exit
            ;;
        -n|--name)
          if [ "$2" ]; then
              name=$2
              shift
          else
              die 'error: "--name" requires a non-empty option argument.'
          fi
          ;;

        -d|--description)
            if [ "$2" ]; then
                description=$2
                shift
            else
                die 'error: "--description" requires a non-empty option argument.'
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

if [ -z "$name" ]; then
    die "missing --name of organization to add/remove"
fi

if [ -z "$remove" ]; then
  psql $DSN --command "insert into organization (name, description) values ('$name', '$description')"
else
  psql $DSN --command "delete from organization where name = '$name'"
fi

psql $DSN --command "select * from organization"
