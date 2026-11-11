---
---

# Overview

> [!IMPORTANT]
>
> **This documentation covers unofficial osu!-related community projects,
> including the g0v0-server emulation and the modified g0v0! client.**
>
> - We (GooGuTeam) are not affiliated with ppy Pty Ltd, peppy, or team osu!.
>   These projects are neither supported nor endorsed by them.
> - **osu!** and **ppy** are registered trademarks of **ppy Pty Ltd**.
> - Please support the original project: play on the
>   [official servers](https://osu.ppy.sh) and consider becoming a
>   [supporter](https://osu.ppy.sh/home/support) to help fund upstream
>   development.
> - For upstream issues and improvements, file issues / PRs on the
>   [upstream client repository](https://github.com/ppy/osu) or the
>   [upstream website repository](https://github.com/ppy/osu-web) or use the
>   [upstream feedback forum](https://osu.ppy.sh/community/forums/5), rather
>   than contacting the upstream team about g0v0!-specific or
>   g0v0-server-specific problems. Report those to the relevant GooGuTeam
>   repository instead.
> - If you have not played the original game, please
>   [download and play the official client](https://osu.ppy.sh/home/download)
>   first. These community projects are not replacements for the original.

g0v0-server (hereinafter referred to as g0v0) is a lazer server written in
Python, supporting the latest lazer client and providing additional features
(e.g., Relax/Autopilot Mod statistics, custom ruleset support).

g0v0 is implemented based on upstream API v2, achieving compatibility with the
vast majority of upstream API v1 and v2. This means you can easily integrate
existing upstream applications into g0v0.

Meanwhile, g0v0 also provides a series of g0v0! APIs to implement operations for
other functionalities outside of the upstream API.

g0v0 is not just a score server. It implements most of the upstream website
features (e.g., chat, user settings, etc.).

Note that g0v0 is just the backend server. If you need a web page, you also need
to deploy a separate [Frontend Page](./deploy/frontend).

## Supported Rulesets

|                     **Ruleset**                      | **ID** | **ShortName** | **PP Algo (rosu)** | **PP Algo (performance-server)** |
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
