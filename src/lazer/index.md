---
---

# 概览

> [!IMPORTANT]
> **本文档介绍 osu! 相关的社区项目，包括上游服务器的模拟实现 g0v0-server 及修改版客户端 g0v0!。**
>
> - 我们（GooGuTeam）与 ppy Pty Ltd、peppy 或 team
>   osu! 无关。此项目未获得其支持，也未获得其认可。
> - **osu!** 和 **ppy** 是 **ppy Pty Ltd** 的注册商标。
> - 请支持原项目：在[官方服务器](https://osu.ppy.sh)游玩，并考虑成为[支持者](https://osu.ppy.sh/home/support)，帮助支持上游开发。
> - 上游问题和改进请向[上游客户端仓库](https://github.com/ppy/osu)或[上游网站仓库](https://github.com/ppy/osu-web)提交 issue
>   /
>   PR，或前往[上游反馈论坛](https://osu.ppy.sh/community/forums/5)。请勿因 g0v0! 或 g0v0-server 的特有问题联系上游团队，此类问题应反馈到对应的 GooGuTeam 仓库。
> - 如果尚未玩过原版，请先[下载并体验官方客户端](https://osu.ppy.sh/home/download)。这些社区项目并非原项目的替代品。

g0v0-server （下称 g0v0）是一个使用 Python 编写的 lazer 服务器，支持最新的 lazer 客户端并提供了额外功能（例如 Relax/Autopilot
Mod 统计信息、自定义 ruleset 支持）。

g0v0 根据 上游 API v2 实现，对 上游 API
v1 和 v2 实现了绝大多数兼容。这意味着你可以轻易将现有的 上游 应用程序接入 g0v0。

同时 g0v0 也提供了一系列 g0v0! API 以在 上游 API 之外实现对其他功能的操作。

g0v0 不仅是一个成绩服务器。它实现了大部分的 上游 网站的功能（例如聊天、用户设置等）。

需要注意，g0v0 只是后端服务器，若需要一个网页，你还需要部署单独的[前端页面](./deploy/frontend)。

## 支持的 ruleset

|                     **Ruleset**                      | **ID** | **ShortName** | **PP 算法 (rosu)** | **PP 算法 (performance-server)** |
| :--------------------------------------------------: | :----: | :-----------: | :----------------: | :------------------------------: |
|                       standard                       |  `0`   |     `osu`     |         ✅         |                ✅                |
|                        taiko                         |  `1`   |    `taiko`    |         ✅         |                ✅                |
|                        catch                         |  `2`   |   `fruits`    |         ✅         |                ✅                |
|                        mania                         |  `3`   |    `mania`    |         ✅         |                ✅                |
|                    standard (RX)                     |  `4`   |    `osurx`    |         ✅         |                ✅                |
|                    standard (AP)                     |  `5`   |    `osuap`    |         ✅         |                ✅                |
|                      taiko (RX)                      |  `6`   |   `taikorx`   |         ✅         |                ✅                |
|                      catch (RX)                      |  `7`   |  `fruitsrx`   |         ✅         |                ✅                |
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
