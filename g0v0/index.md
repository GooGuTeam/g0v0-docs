---
---

# g0v0!

**g0v0!** 是由 GooGuTeam 基于
[ppy/osu](https://github.com/ppy/osu)（osu!lazer）开源代码构建并维护的节奏游戏客户端，开箱即用地对接
[g0v0-server](/lazer/)。

g0v0! 完整保留了 osu!lazer 的玩法、UI 与框架行为，仅在与服务器交互的部分做了少量必要改动（例如自定义 API 服务器、Relax
/ Autopilot 特殊 ruleset）。这些改动构成了
**g0v0! 标准**——任何客户端只要实现了 g0v0! 标准，就可以完美兼容所有基于 g0v0! 的服务器，详见[与 osu!(lazer) 的差异](./difference)。

## 下载

g0v0! 支持 Windows（x64 / ARM64）、macOS（Intel / Apple Silicon）、Linux（x64 /
ARM64）、Android 与 iOS。

前往 [GitHub Releases](https://github.com/GooGuTeam/g0v0/releases/latest)
下载最新版本：

| 平台                   | 文件                                                               |
| :--------------------- | :----------------------------------------------------------------- |
| Windows x64            | `g0v0-win-Setup.exe`（安装版）或 `g0v0-win-Portable.zip`（便携版） |
| Windows ARM64          | `g0v0-win-arm64-Setup.exe` 或 `g0v0-win-arm64-Portable.zip`        |
| macOS（Intel）         | `g0v0.app.Intel.zip`                                               |
| macOS（Apple Silicon） | `g0v0.app.Apple.Silicon.zip` 或 `g0v0-osx-arm64-Setup.pkg`         |
| Linux x64              | `g0v0.AppImage`                                                    |
| Linux ARM64            | `g0v0-arm64.AppImage`                                              |
| Android                | `g0v0.apk`                                                         |
| iOS                    | `g0v0-ios.ipa`                                                     |

桌面端（Windows / macOS /
Linux）内置自动更新，安装后会自动跟随新版本；也可以在设置的更新选项中禁用自动更新。

如何让客户端连接到自建服务器，请参阅[通过客户端连接到服务器](/lazer/deploy/login-from-client)。

## 许可

- 代码采用 MIT 许可：上游 ppy 部分见
  [LICENCE-OSU](https://github.com/GooGuTeam/g0v0/blob/v2/LICENCE-OSU)，GooGuTeam 新增部分见
  [LICENCE](https://github.com/GooGuTeam/g0v0/blob/v2/LICENCE)。
- 游戏资源源自 ppy/osu-resources，采用 CC-BY-NC 4.0 许可，仅限非商业使用。
- "osu!" 名称、商标与品牌资产归 ppy Pty Ltd 所有，本项目与 ppy Pty
  Ltd 无从属或背书关系。
