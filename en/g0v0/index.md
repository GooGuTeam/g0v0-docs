---
---

# g0v0!

> [!IMPORTANT]
>
> **g0v0! is an unofficial client modified from the osu! open-source codebase.**
>
> - We (GooGuTeam) are not affiliated with ppy Pty Ltd, peppy, or team osu!.
>   These projects are neither supported nor endorsed by them.
> - **osu!** and **ppy** are registered trademarks of **ppy Pty Ltd**.
> - Please support the original project: play on the
>   [official servers](https://osu.ppy.sh) and consider becoming a
>   [supporter](https://osu.ppy.sh/home/support) to help fund upstream
>   development.
> - For upstream issues and improvements, file issues / PRs on the
>   [upstream client repository](https://github.com/ppy/osu) or use the
>   [upstream feedback forum](https://osu.ppy.sh/community/forums/5), rather
>   than contacting the upstream team about g0v0!-specific or
>   g0v0-server-specific problems. Report those to the relevant GooGuTeam
>   repository instead.
> - If you have not played the original game, please
>   [download and play the official client](https://osu.ppy.sh/home/download)
>   first. These community projects are not replacements for the original.

**g0v0!** is a free and open rhythm game client maintained by GooGuTeam,
designed to connect to [g0v0-server](/en/lazer/). It extends the upstream
codebase with custom server integration, Relax / Autopilot special rulesets, and
additional interface and gameplay features.

The **g0v0! Standard** defines server extension conventions for compatible
community servers. See [Differences from upstream](./difference) for details.

## Download

g0v0! is available for Windows (x64 / ARM64), macOS (Intel / Apple Silicon),
Linux (x64 / ARM64), Android, and iOS.

Grab the latest build from
[GitHub Releases](https://github.com/GooGuTeam/g0v0/releases/latest):

| Platform              | File                                                                   |
| :-------------------- | :--------------------------------------------------------------------- |
| Windows x64           | `g0v0-win-Setup.exe` (installer) or `g0v0-win-Portable.zip` (portable) |
| Windows ARM64         | `g0v0-win-arm64-Setup.exe` or `g0v0-win-arm64-Portable.zip`            |
| macOS (Intel)         | `g0v0.app.Intel.zip`                                                   |
| macOS (Apple Silicon) | `g0v0.app.Apple.Silicon.zip` or `g0v0-osx-arm64-Setup.pkg`             |
| Linux x64             | `g0v0.AppImage`                                                        |
| Linux ARM64           | `g0v0-arm64.AppImage`                                                  |
| Android               | `g0v0.apk`                                                             |
| iOS                   | `g0v0-ios.ipa`                                                         |

Desktop builds (Windows / macOS / Linux) ship with automatic updates and will
follow new releases after installation; automatic updates can also be disabled
in the update settings.

To connect the client to your own server, see
[Connect from the Client](/en/lazer/deploy/login-from-client).

## Licence

- The code is licensed under the MIT Licence: the upstream portions under
  [LICENCE-OSU](https://github.com/GooGuTeam/g0v0/blob/v2/LICENCE-OSU), and
  GooGuTeam's additions under
  [LICENCE](https://github.com/GooGuTeam/g0v0/blob/v2/LICENCE).
- Game resources are derived from the upstream resource repository and are
  licensed under CC-BY-NC 4.0 for non-commercial use only.
