---
---

# 概览

g0v0-server （下称 g0v0）是一个使用 Python 编写的 osu!(lazer) 服务器，支持最新的 osu!(lazer) 客户端并提供了额外功能（例如 Relax/Autopilot
Mod 统计信息、自定义 ruleset 支持）。

g0v0 根据 osu! API v2 实现，对 osu! API
v1 和 v2 实现了绝大多数兼容。这意味着你可以轻易将现有的 osu! 应用程序接入 g0v0。

同时 g0v0 也提供了一系列 g0v0! API 以在 osu! API 之外实现对其他功能的操作。

g0v0 不仅是一个成绩服务器。它实现了大部分的 osu! 网站的功能（例如聊天、用户设置等）。

需要注意，g0v0 只是后端服务器，若需要一个网页，你还需要部署单独的[前端页面](/lazer/frontend)。

## 支持的 ruleset

|                     **Ruleset**                      | **ID** | **ShortName** | **PP 算法 (rosu)** | **PP 算法 (performance-server)** |
| :--------------------------------------------------: | :----: | :-----------: | :----------------: | :------------------------------: |
|                         osu!                         |  `0`   |     `osu`     |         ✅         |                ✅                |
|                      osu!taiko                       |  `1`   |    `taiko`    |         ✅         |                ✅                |
|                      osu!catch                       |  `2`   |   `fruits`    |         ✅         |                ✅                |
|                      osu!mania                       |  `3`   |    `mania`    |         ✅         |                ✅                |
|                      osu! (RX)                       |  `4`   |    `osurx`    |         ✅         |                ✅                |
|                      osu! (AP)                       |  `5`   |    `osuap`    |         ✅         |                ✅                |
|                    osu!taiko (RX)                    |  `6`   |   `taikorx`   |         ✅         |                ✅                |
|                    osu!catch (RX)                    |  `7`   |  `fruitsrx`   |         ✅         |                ✅                |
|  [sentakki](https://github.com/LumpBloom7/sentakki)  |  `10`  |  `Sentakki`   |         ❌         |                ❌                |
|        [tau](https://github.com/taulazer/tau)        |  `11`  |     `tau`     |         ❌         |                ✅                |
|    [Rush!](https://github.com/Beamographic/rush)     |  `12`  |    `rush`     |         ❌         |                ❌                |
| [hishigata](https://github.com/LumpBloom7/hishigata) |  `13`  |  `hishigata`  |         ❌         |                ❌                |
| [soyokaze!](https://github.com/goodtrailer/soyokaze) |  `14`  |  `soyokaze`   |         ❌         |                ✅                |

自定义 ruleset 由 GooGuTeam 修改，以匹配 g0v0。前往
[GitHub](https://github.com/GooGuTeam/custom-rulesets/releases/latest)
下载自定义 ruleset。

## 许可

g0v0 采用 **GNU Affero General Public License v3.0 (AGPL-3.0-only)**
授权。任何衍生作品、修改或部署 **必须在显著位置清晰署名** 原始作者：
**GooGuTeam - <https://github.com/GooGuTeam/g0v0-server>**

## 参与讨论

- QQ 群：`1059561526`
- Discord: <https://discord.gg/AhzJXXWYfF>
