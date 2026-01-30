---
---

# Recalculate Performance Points and Statistics

This section introduces how to use the `tools/recalculate.py` tool to
recalculate pp, leaderboards, star ratings, and other data.

## Usage

The script is located at `tools/recalculate.py`. Basic usage is as follows:

```sh
usage: recalculate.py [-h] [--dry-run] [--concurrency CONCURRENCY] [--output-csv OUTPUT_CSV] [--max-cached-beatmaps-count MAX_CACHED_BEATMAPS_COUNT]
                      [--additional-count ADDITIONAL_COUNT]
                      {performance,leaderboard,rating,all} ...
```

:::tip Tip

If you deployed g0v0 using Docker, please use the following command to run the
script:

```sh
docker exec -it g0v0-server uv run --no-sync python tools/recalculate.py
```

:::

### Common Arguments

- `-h, --help`: Show help message.
- `--dry-run`: Run command without committing changes.
- `--concurrency CONCURRENCY`: Maximum number of concurrent tasks.
- `--output-csv OUTPUT_CSV`: Output results to the specified CSV file.

## Recalculate Performance Point

You can use the subcommand `performance` to recalculate pp, and it supports
using some filters. Please use the `-h` option to view available filters.

```sh
uv run --no-sync python tools/recalculate.py performance -h
```

This command is used to recalculate players' pp and best scores.

## Recalculate Leaderboard and Statistics

If you changed settings regarding beatmaps or statistics, you can use the
subcommand `leaderboard` to recalculate. You can also use the `-h` option to
view filters.

```sh
uv run --no-sync python tools/recalculate.py leaderboard -h
```

This command is used to recalculate leaderboards and users' statistics (such as
total playtime, maximum combo, so on).

## Recalculate Star Ratings

If you changed or updated the performance calculator, you might need to
recalculate star ratings for all beatmaps. Use the `rating` subcommand. Use the
`-h` option to view filters.

```sh
uv run --no-sync python tools/recalculate.py rating -h
```

## Recalculate All

We provide a shortcut subcommand `all` to recalculate star ratings, pp, and
leaderboards at once. The execution order is: Star Ratings (rating) -> PP
(performance) -> Leaderboards (leaderboard).

```sh
uv run --no-sync python tools/recalculate.py all
```
