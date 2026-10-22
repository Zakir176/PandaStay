# Supabase database files

## Live database procedure

**The live DB only ever receives files from `migrations/`, applied in filename order:**

1. `migrations/20261020_security_round_3.sql`
2. `migrations/20261021_security_round_4.sql`
3. `migrations/20261022_security_round_5.sql`

New changes go in a new, later-dated migration file. Never edit an applied one.

## `schema.reset.sql` — DESTRUCTIVE

Drops every table and type with `CASCADE`, then rebuilds from scratch. It is for
local/throwaway databases only. **Never run it against the live database.**
It is kept in sync with the migrations so a fresh local DB matches production.

## `seed.sql`

Demo data for local databases only. Do not run against live.
