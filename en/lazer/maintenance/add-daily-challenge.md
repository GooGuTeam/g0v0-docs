---
---

# Add Daily Challenge

You can add Daily Challenges to the server via script tools or by directly
manipulating the Redis database.

## Add via Tool

Ensure that the project environment variables (`.env`) are configured, then run
the following python script:

```sh
python tools/add_daily_challenge.py
```

:::tip Tip

If you deployed g0v0 using Docker, please use the following command to run the
script:

```sh
docker exec -it g0v0-server uv run --no-sync python tools/add_daily_challenge.py
```

:::

After running the script, follow the terminal prompts to input the corresponding
content to complete the addition.

## Manual Add

You can use `redis-cli` or other Redis management tools to connect to the Redis
database and add daily challenges by setting Hash.

You need to set the HashMap structure as follows:

```redis
HSET daily_challenge:%Y-%m-%d beatmap <beatmap_id>
HSET daily_challenge:%Y-%m-%d ruleset_id <gamemode_id>
HSET daily_challenge:%Y-%m-%d required_mods [additional required mods, optional, default empty]
HSET daily_challenge:%Y-%m-%d allowed_mods [additional Freemods, optional, default all (meeting `required_mods` requirements)]
```

### Parameter Description

- `%Y-%m-%d` is the date the daily challenge applies to. e.g. `2025-08-10`.
- `beatmap`: Beatmap ID.
- `ruleset_id`: Game Mode ID.
- `required_mods`: Additional required mods.
- `allowed_mods`: Additional Freemods.

### Application

Wait until 00:00 UTC or restart the server, and the server will automatically
apply the Daily Challenge.
