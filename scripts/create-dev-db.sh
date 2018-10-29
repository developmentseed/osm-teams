#!/bin/bash
set -e

POSTGRES_USER=${1:-postgres}

psql $POSTGRES_USER -v ON_ERROR_STOP=1 <<-EOSQL
  CREATE DATABASE osm_teams;
  CREATE ROLE osm_teams WITH ENCRYPTED PASSWORD 'test';
  GRANT ALL PRIVILEGES ON DATABASE "osm_teams" TO "osm_teams";
  ALTER ROLE "osm_teams" WITH LOGIN;
EOSQL
