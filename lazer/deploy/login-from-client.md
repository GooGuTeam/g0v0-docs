# 通过 osu!(lazer) 客户端连接到服务器

osu!(lazer) 客户端本身不支持像 osu!(stable) 那样通过命令行 (`-devserver`) 连接到服务器。因此，若想连接到你的服务器，你需要使用经由我们修改的自定义的 osu!(lazer) 客户端——[osu! GU](https://github.com/GooGuTeam/osu)
或者使用
[LazerAuthlibInjection](https://github.com/MingxuanGame/LazerAuthlibInjection)
来注入客户端的连接配置。

## 使用 osu! GU

此方法推荐给所有能在其平台上运行 osu!(lazer) 的用户。

### 步骤

1. **下载 osu! GU**

   从 [GitHub Releases](https://github.com/GooGuTeam/osu/releases/latest)
   下载最新版本。

2. **配置服务器 URL**

   在 osu!(lazer) 的设置中找到“在线”部分，找到“Custom API Server
   URL”设置项，并在其输入框中输入你的服务器地址（例如：`lazer-api.g0v0.top`）。

   ![osu-gu-connect-to-server](/public/images/osu-gu-connect-to-server.jpg)

3. **重启客户端**

   输入 URL 后退出 osu!(lazer) 并重新启动即可生效。

## 使用 LazerAuthlibInjection

[LazerAuthlibInjection](https://github.com/MingxuanGame/LazerAuthlibInjection)
是一个为官方 osu!(lazer) 客户端添加自定义服务器支持的 ruleset。

:::warning 警告

虽然我们仍未发现使用此 ruleset 导致的封禁案例，但我们建议你尽量**不要将安装 LazerAuthlibInjection 后的 osu!(lazer) 客户端连接到官方服务器！**

此项目与 osu! 官方团队无任何关联，也未获得其认可。**使用风险自负。**
**请勿向 osu! 官方团队报告任何关于此 ruleset 的问题。**

:::

### 支持的平台

- Linux (amd64, arm64)
- Windows (amd64, arm64)
- macOS (Intel, Apple Silicon)

### 安装步骤

1. **打开 osu! 数据目录**

   在设置面板中，点击 `打开 osu! 文件夹` 来打开 osu! 数据目录。

   默认位置：
   - Windows: `%AppData%\osu!`
   - Linux: `~/.local/share/osu`
   - macOS: `~/Library/Application Support/osu`

2. **安装 LazerAuthlibInjection**

   从
   [Releases 页面](https://github.com/MingxuanGame/LazerAuthlibInjection/releases/latest)
   下载最新版本，并将 `osu.Game.Rulesets.AuthlibInjection.dll` 复制到 `rulesets`
   目录中。

3. **配置 LazerAuthlibInjection**

   在设置面板中点击“游戏模式”，然后配置：
   - `API Url`: 你的自定义服务器 API URL（例如：`https://lazer-api.g0v0.top`）
   - `Website Url`: 你的自定义服务器网站 URL（例如：`https://lazer.g0v0.top`）

   然后点击 `Save Changes` 保存设置。

   ![authlib-injection-settings](/public/images/lazer-authlib-injection-connect-to-server.jpg)

4. **重启客户端**

   重启 osu!(lazer) 使配置生效。

### 命令行参数

你也可以通过命令行参数传递设置：

| 参数                       | 说明                                                             |
| -------------------------- | ---------------------------------------------------------------- |
| `--api-url` / `-devserver` | API URL                                                          |
| `--website-url`            | 网站 URL                                                         |
| `--client-id`              | Client ID                                                        |
| `--client-secret`          | Client Secret                                                    |
| `--spectator-url`          | 观战服务 URL                                                     |
| `--multiplayer-url`        | 多人游戏服务 URL                                                 |
| `--metadata-url`           | 元数据服务 URL                                                   |
| `--bss-url`                | 谱面提交服务 URL                                                 |
| `--disable-sentry-logger`  | 禁用向 osu! 官方发送 Sentry 日志                                 |
| `--non-g0v0-server`        | 禁用 g0v0-server 特定功能（Relax 功能、自定义 ruleset 成绩提交） |

**示例：**

```bash
osu!.exe --api-url=lazer-api.g0v0.top --website-url=lazer.g0v0.top --disable-sentry-logger
```
