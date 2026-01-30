---
---

# 重新计算表现分和统计信息

本节介绍了如何使用 `tools/recalculate.py`
工具来重新计算 pp、排行榜、难度星级等数据。

## 使用方法

脚本位于 `tools/recalculate.py`。基本用法如下：

```sh
usage: recalculate.py [-h] [--dry-run] [--concurrency CONCURRENCY] [--output-csv OUTPUT_CSV] [--max-cached-beatmaps-count MAX_CACHED_BEATMAPS_COUNT]
                      [--additional-count ADDITIONAL_COUNT]
                      {performance,leaderboard,rating,all} ...
```

:::tip 提示

如果你使用 Docker 部署 g0v0，请使用以下命令运行脚本：

```sh
docker exec -it g0v0-server uv run --no-sync python tools/recalculate.py
```

:::

### 常用参数

- `-h, --help`: 显示帮助信息。
- `--dry-run`: 执行命令但不提交更改。
- `--concurrency CONCURRENCY`: 最大并发任务数。
- `--output-csv OUTPUT_CSV`: 将结果输出到指定的 CSV 文件。

## 重新计算 pp

你可以使用子命令 `performance` 来重新计算 pp，并支持使用一些过滤器。请使用 `-h`
选项查看可用的过滤器。

```sh
uv run --no-sync python tools/recalculate.py performance -h
```

此命令用于重新计算玩家的 pp 和最佳成绩。

## 重新计算排行榜和统计数据

如果你更改了有关谱面或统计信息的设置，可以使用子命令 `leaderboard`
进行重新计算。同样可以使用 `-h` 选项查看过滤器。

```sh
uv run --no-sync python tools/recalculate.py leaderboard -h
```

此命令用于重新计算排行榜和用户的统计信息（包括游玩时间、最大连击数等）。

## 重新计算难度星级 (Star Ratings)

如果你更换或更新了表现分计算器，可能需要重新计算所有谱面的难度星级（Star
Ratings）。使用 `rating` 子命令。使用 `-h` 选项查看过滤器。

```sh
uv run --no-sync python tools/recalculate.py rating -h
```

## 全部重新计算

我们提供了一个快捷子命令 `all`
来一次性重新计算星级、pp 和排行榜。执行顺序为：难度星级 (rating) -> pp
(performance) -> 排行榜 (leaderboard)。

```sh
uv run --no-sync python tools/recalculate.py all
```
