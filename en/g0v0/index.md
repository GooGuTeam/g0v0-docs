---
---

# g0v0!

**g0v0!** is a rhythm game client built and maintained by GooGuTeam on top of
the open-source [ppy/osu](https://github.com/ppy/osu) (osu!lazer) codebase,
ready to work with [g0v0-server](/en/lazer/) out of the box.

g0v0! keeps all gameplay, UI, and framework behaviour of osu!lazer intact and
only changes the parts that talk to the server (for example a custom API server
and Relax / Autopilot special rulesets). Together these changes form the **g0v0!
Standard** — any client that implements the g0v0! Standard is fully compatible
with every g0v0-based server. See [Differences from osu!(lazer)](./difference)
for details.

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

- The code is licensed under the MIT Licence: the upstream ppy parts under
  [LICENCE-OSU](https://github.com/GooGuTeam/g0v0/blob/v2/LICENCE-OSU), and
  GooGuTeam's additions under
  [LICENCE](https://github.com/GooGuTeam/g0v0/blob/v2/LICENCE).
- Game resources are derived from ppy/osu-resources and are licensed under
  CC-BY-NC 4.0 for non-commercial use only.
- The "osu!" name, trademarks, and brand assets remain the property of ppy Pty
  Ltd; this project is not affiliated with or endorsed by ppy Pty Ltd.
