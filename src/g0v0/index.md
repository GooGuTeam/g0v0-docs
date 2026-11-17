---
---

# g0v0!

> [!IMPORTANT]
>
> **g0v0! 是基于 osu! 开源代码修改的非官方客户端。**
>
> - 我们（GooGuTeam）与 ppy Pty Ltd、peppy 或 team
>   osu! 无关。此项目未获得其支持，也未获得其认可。
> - **osu!** 和 **ppy** 是 **ppy Pty Ltd** 的注册商标。
> - 请支持原项目：在[官方服务器](https://osu.ppy.sh)游玩，并考虑成为[支持者](https://osu.ppy.sh/home/support)，帮助支持上游开发。
> - 上游问题和改进请向[上游客户端仓库](https://github.com/ppy/osu)提交 issue /
>   PR，或前往[上游反馈论坛](https://osu.ppy.sh/community/forums/5)。请勿因 g0v0! 或 g0v0-server 的特有问题联系上游团队，此类问题应反馈到对应的 GooGuTeam 仓库。
> - 如果尚未玩过原版，请先[下载并体验官方客户端](https://osu.ppy.sh/home/download)。这些社区项目并非原项目的替代品。

**g0v0!** 是由 GooGuTeam 维护的自由开放节奏游戏客户端，面向
[g0v0-server](/lazer/)。它基于上游开源代码，提供自定义服务器接入、Relax /
Autopilot 特殊规则集，以及额外的界面与玩法功能。

**g0v0! 标准**是一组服务器扩展约定，供客户端对接兼容的社区服务器。详见[与上游的差异](./difference)。

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

- 代码采用 MIT 许可：上游部分见
  [LICENCE-OSU](https://github.com/GooGuTeam/g0v0/blob/v2/LICENCE-OSU)，GooGuTeam 新增部分见
  [LICENCE](https://github.com/GooGuTeam/g0v0/blob/v2/LICENCE)。
- 游戏资源源自上游资源仓库，采用 CC-BY-NC 4.0 许可，仅限非商业使用。
