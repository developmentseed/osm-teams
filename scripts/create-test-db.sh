#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
  CREATE DATABASE osm_teams_test;
  CREATE ROLE osm_teams_test WITH LOGIN PASSWORD 'test';
  GRANT ALL PRIVILEGES ON DATABASE "osm_teams_test" TO osm_teams_test;
EOSQL
