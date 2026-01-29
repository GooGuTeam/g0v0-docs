---
---

# Overview

g0v0-server (hereinafter referred to as g0v0) is an osu!(lazer) server written
in Python, supporting the latest osu!(lazer) client and providing additional
features (e.g., Relax/Autopilot Mod statistics, custom ruleset support).

g0v0 is implemented based on osu! API v2, achieving compatibility with the vast
majority of osu! API v1 and v2. This means you can easily integrate existing
osu! applications into g0v0.

Meanwhile, g0v0 also provides a series of g0v0! APIs to implement operations for
other functionalities outside of the osu! API.

g0v0 is not just a score server. It implements most of the osu! website features
(e.g., chat, user settings, etc.).

Note that g0v0 is just the backend server. If you need a web page, you also need
to deploy a separate [Frontend Page](./deploy/frontend).

## Supported Rulesets

|                     **Ruleset**                      | **ID** | **ShortName** | **PP Algo (rosu)** | **PP Algo (performance-server)** |
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

Custom rulesets are modified by GooGuTeam to match g0v0. Visit
[GitHub](https://github.com/GooGuTeam/custom-rulesets/releases/latest) to
download custom rulesets.

## License

g0v0 is licensed under **GNU Affero General Public License v3.0
(AGPL-3.0-only)**. Any derivative works, modifications, or deployments **MUST
clearly attribute** the original author in a prominent place: **GooGuTeam -
<https://github.com/GooGuTeam/g0v0-server>**

## Join Discussion

- Discord: <https://discord.gg/AhzJXXWYfF>
- QQ Group: `1059561526`
