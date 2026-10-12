---
---

# 与 osu!(lazer) 的差异

g0v0! 基于
[ppy/osu](https://github.com/ppy/osu)（osu!lazer）的开源代码构建。除下文列出的改动外，其余玩法、UI 与框架行为均与上游保持一致；所有改动都旨在配合
[g0v0-server](/lazer/) 工作。以下内容以
[v2026.1012.1-robin](https://github.com/GooGuTeam/g0v0/releases/tag/v2026.1012.1-robin)
为准。

## g0v0! 标准

下述带 <Badge type="standard" text="g0v0! 标准" />
的修改共同构成了由 g0v0-server 定义的一组服务器扩展约定。
**任何客户端只要实现了 g0v0! 标准，就可以完美兼容所有基于 g0v0! 的服务器。**
g0v0! 是 g0v0! 标准的参考实现。

g0v0! 标准只针对**与服务器通信的部分**。与原版 osu!(lazer) 的通信相比，额外增加了：

| 通信环节       | 原版 osu!(lazer)              | g0v0!                                                                                             |
| :------------- | :---------------------------- | :------------------------------------------------------------------------------------------------ |
| API / Web 端点 | 固定指向 ppy 服务器，不可配置 | 可在设置中自定义，单一 URL 派生全部端点                                                           |
| SignalR 连接   | 携带客户端版本哈希头          | 额外携带 `X-Osu-Ruleset-Hashes` 头                                                                |
| 成绩提交       | 附带客户端版本哈希            | 额外附带 `ruleset_hash` 参数                                                                      |
| ruleset 集合   | 官方 4 种（OnlineID 0–3）     | 另有 `osurx` / `osuap` / `taikorx` / `fruitsrx`（4–7）；自定义 ruleset 可由服务器注册、校验与分发 |
| 多人房间       | playlist 无胜利条件           | 新增 `win_condition` 字段                                                                         |
| 私有 API       | 无                            | `/private` 路由（g0v0! API）与扩展端点                                                            |

以下各节的「开发者参考」折叠框面向希望实现 g0v0! 标准的客户端开发者，说明与服务器通信需要改动的部分与实现思路。

## 自定义 API 服务器 <Badge type="standard" text="g0v0! 标准" />

- 玩家可以在 **设置 → 在线**
  中指定「自定义 API 服务器链接」，从而连接第三方服务器。
- 单一自定义 URL 会同时替换 API 与 Website 端点，并派生全部实时端点：
  `/signalr/spectator`、`/signalr/multiplayer`、`/signalr/metadata` 与
  `/beatmap-submission`，与 g0v0-server 的部署路径一一对应（原版这些端点固定指向 ppy 服务器且不可配置）。
- 设置界面提供 URL 校验（无效时给出提示）以及「需要重启」提示；省略协议时自动补全
  `https://`。
- 在线资源（皮肤、预览音轨等）经信任域过滤：仅在已配置自定义服务器时放行，否则仅允许
  `.ppy.sh` / `.g0v0.top` 域名，其余外部资源请求会被阻断。
- 客户端默认生产端点即官方 g0v0 实例（`lazer.g0v0.top` /
  `lazer-api.g0v0.top`）。

::: details 开发者参考

实现要点：提供一条可配置的服务器基础 URL，在构造端点配置时用这一条 URL 派生全部端点，重启后生效。

1. 构造端点时替换 API 与 Website 端点，并按约定路径派生实时端点（g0v0! 见
   `osu.Game/OsuGameBase.cs` 的 `CreateEndpoints()`）：

   ```csharp
   config.APIUrl = customUrl;
   config.WebsiteUrl = customUrl;
   config.SpectatorUrl = $"{customUrl}/signalr/spectator";
   config.MultiplayerUrl = $"{customUrl}/signalr/multiplayer";
   config.MetadataUrl = $"{customUrl}/signalr/metadata";
   config.BeatmapSubmissionServiceUrl = $"{customUrl}/beatmap-submission";
   ```

2. 路径约定与 g0v0-server 部署一一对应：API 即服务器根，SignalR 位于
   `/signalr/*`，谱面提交位于 `/beatmap-submission`；鉴权沿用 osu! API
   v2 的 OAuth 流程（客户端凭据随端点配置提供）。
3. 信任域过滤必须调整：放行非 `.ppy.sh`
   的域名（即自定义服务器的域名），否则皮肤、预览音轨等在线资源无法加载（g0v0! 见
   `osu.Game/Online/TrustedDomainOnlineStore.cs` 与
   `osu.Game/Audio/PreviewTrackManager.cs`，其做法为配置自定义服务器后放行全部）。可选加固：只多放行
   `.g0v0.top` 域名。
4. （可选）增加配置项保存基础 URL（g0v0! 见
   `osu.Game/Configuration/OsuConfigManager.cs` 的 `OsuSetting.CustomApiUrl`）。

:::

## 特殊 ruleset（Relax / Autopilot） <Badge type="standard" text="g0v0! 标准" />

- 对 **Relax (RX)** 与 **Autopilot (AP)** 特殊游戏模式提供一等支持。
- 与 g0v0-server 约定的特殊 ruleset 标识：`osurx`（4）、`osuap`（5）、`taikorx`（6）、`fruitsrx`（7），对应官方 osu!
  / taiko / catch（0–2）。
- 以基础 ruleset 搭配 Relax / Autopilot
  mod 游玩时，成绩与统计按对应特殊 ruleset 的身份处理。
- 为 Relax 模式提供专属的难度与 PP（performance）计算，包括独立的
  `RelaxAimEvaluator`、`RelaxRhythmEvaluator` 与 Relax 难度 skill。
- 个人资料与覆盖层中的 ruleset 选择器会通过弹出菜单展示特殊 ruleset，用户统计信息按特殊 ruleset 分别获取。

::: details 开发者参考

实现要点：特殊 ruleset 是在官方 ruleset 基础上「改名换 ID」得到的在线身份，通信全部走标准 osu!
API v2 端点，不需要额外的私有路由。

1. 按约定保留 shortName 与 OnlineID（g0v0! 见 `osu.Game/Rulesets/RulesetInfo.cs`
   的常量与 `CreateSpecialRuleset()`）：

   ```csharp
   public const string OSU_RELAX_MODE_SHORTNAME = "osurx";
   public const int OSU_RELAX_ONLINE_ID = 4; // 其余：osuap=5、taikorx=6、fruitsrx=7
   ```

2. 以基础 ruleset 搭配 Relax / Autopilot
   mod 提交的成绩与统计查询，按 mod 映射到特殊 ruleset 身份后再走标准端点（g0v0! 见
   `CreateSpecialRulesetByScore()`、`osu.Game/Online/LocalUserStatisticsProvider.cs`、
   `osu.Game/Online/UserStatisticsWatcher.cs`），服务器据此分池记录统计与排名。

:::

## ruleset 哈希校验 <Badge type="standard" text="g0v0! 标准" />

- 客户端启动时，对官方 4 种 ruleset 之外的所有 ruleset 的程序集文件计算 MD5，并按 shortName 缓存。
- 所有 SignalR 连接（spectator / multiplayer / metadata /
  notifications 等）在原有 `X-Osu-Version-Hash` 头之外，额外附带
  `X-Osu-Ruleset-Hashes`
  头（JSON：`{ shortName: md5 }`），用于服务器端的完整性校验。
- 成绩提交（solo 与房间 playlist）在原有版本哈希之外，额外附带 `ruleset_hash`
  查询参数（仅当前 ruleset 为自定义 ruleset 时发送）。
- 当服务器对这些哈希做完整性校验失败时（ruleset 缺失、不被支持或已过期），加入多人房间会被拒绝，并列出相关 ruleset 与服务器端版本。
- **设置 → 游戏模式 → 在线模式**
  会对照服务器注册表展示本地 ruleset 的状态（内置 / 未安装 / 不受支持 / 最新 / 可更新），并可直接下载更新。<Badge type="g0v0" text="v2026.1012.0-g0v0" />

::: details 开发者参考

实现要点：让服务器能够识别客户端实际加载的自定义 ruleset 版本，共两个上报点。

1. 启动时对所有非官方 ruleset（OnlineID
   0–3 之外）的程序集文件计算 MD5，按 shortName 缓存（g0v0! 见
   `osu.Game/Rulesets/RulesetHashCache.cs`）：

   ```csharp
   using var str = File.OpenRead(instance.GetType().Assembly.Location);
   RulesetsHashes[instance.ShortName] = str.ComputeMD5Hash();
   ```

2. 每条 SignalR 连接的握手 options 附加 `X-Osu-Ruleset-Hashes` 头，值为
   `{ shortName: md5 }` 的 JSON；上游原有的 `X-Osu-Version-Hash`
   保持不变（g0v0! 见 `osu.Game/Online/HubClientConnector.cs`）：

   ```csharp
   options.Headers.Add("X-Osu-Ruleset-Hashes",
       JsonConvert.SerializeObject(rulesetHashCache.RulesetsHashes));
   ```

3. 成绩提交（solo 与房间 playlist）附加 `ruleset_hash`
   查询参数，仅当前 ruleset 为自定义 ruleset 时发送（g0v0! 见
   `osu.Game/Online/Solo/CreateSoloScoreRequest.cs`、
   `osu.Game/Online/Rooms/CreateRoomScoreRequest.cs`）：

   ```csharp
   if (!string.IsNullOrEmpty(rulesetHash))
       req.AddParameter("ruleset_hash", rulesetHash);
   ```

:::

## 多人房间胜利条件 <Badge type="standard" text="g0v0! 标准" />

- playlist / multiplayer 的房间项新增 `win_condition` 字段（Score / Accuracy /
  Combo，上游协议没有该字段）。
- 房间内排行榜按所选胜利条件排序（并带平局 tiebreaker 规则），房间底部提供胜利条件选择按钮。

::: details 开发者参考

实现要点：在上游 playlist 协议上扩展一个可选字段；客户端创建/编辑房间时上报，接收房间状态时还原，并保证本地排序与服务器判定一致。

1. 定义枚举 `Score` / `Accuracy` / `Combo`，缺省 `Score`（g0v0! 见
   `osu.Game/Online/Multiplayer/WinCondition.cs`）。
2. 房间项（playlist 与 multiplayer playlist）序列化增加 `win_condition`
   字段（g0v0! 见 `osu.Game/Online/Rooms/PlaylistItem.cs`、
   `osu.Game/Online/Multiplayer/MultiplayerPlaylistItem.cs`）：

   ```csharp
   [JsonProperty("win_condition")]
   public WinCondition? WinCondition { get; set; }
   ```

3. 房间与观战排行榜按该字段排序（含平局 tiebreaker），保证与服务器判定一致（g0v0! 见
   `osu.Game/Screens/Play/Leaderboards/MultiplayerLeaderboardProvider.cs`、
   `MultiSpectatorLeaderboardProvider.cs`）。

:::

## g0v0! API <Badge type="standard" text="g0v0! 标准" />

- `PrivateAPIRequest` 请求基类指向服务器 `/private` 路由，作为 g0v0!
  API 的客户端入口，在 osu! API v2 之外提供私有操作能力。
- osu!
  API 扩展示例：`PUT me/achievements/{id}`（勋章解锁，配合客户端的勋章授予器）。
- osu! API 扩展示例：`GET beatmaps/{beatmapId}/scores/users/{userId}/all`
  （一次取回某谱面的全部个人成绩，供结果界面独立于分数排序挑选 PP 最佳）。<Badge type="g0v0" text="v2026.1012.0-g0v0" />

::: details 开发者参考

实现要点：私有操作走服务器 `/private` 路由，复用 osu! API
v2 的鉴权与序列化基础设施；对 osu! API 的扩展则保持上游风格直接加端点。

1. 定义 Route 固定为 `private` 的请求基类（g0v0! 见
   `osu.Game/Online/API/PrivateAPIRequest.cs`）：

   ```csharp
   public abstract class PrivateAPIRequest : APIRequest
   {
       protected override string Route => @"private";
   }
   ```

2. osu! API 扩展按常规 APIRequest 实现，如勋章解锁
   `PUT me/achievements/{id}`（g0v0! 见
   `osu.Game/Online/API/Requests/UnlockMedalRequest.cs`）。
3. 公共查询扩展同样按常规 APIRequest 实现，如
   `GET beatmaps/{beatmapId}/scores/users/{userId}/all?mode={shortName}`
   （g0v0! 见 `osu.Game/Online/API/Requests/GetBeatmapUserScoresRequest.cs`）。

:::

## 自定义 ruleset 管理 <Badge type="standard" text="g0v0! 标准" /> <Badge type="g0v0" text="v2026.1012.0-g0v0" />

- 服务器可以通过 g0v0!
  API 注册自定义 ruleset 及其版本，客户端据此展示、校验并下载更新。
- 端点（`/private` 路由）：
  - `GET private/gamemodes`：服务器提供的规则模式列表（`id`、`name`、`readable`、`is_official`、`is_custom_ruleset`），并声明是否支持 Relax
    / Autopilot（`enable_rx` / `enable_ap`）；
  - `GET private/gamemodes/versions`：各自定义 ruleset 的版本信息（`latest_version`、`versions`：版本 → 程序集 MD5 的映射、`download_url`）。官方模式随客户端分发，不在此列。
- 客户端在 **设置 → 游戏模式 → 在线模式**
  中对照本地安装的 ruleset（与「ruleset 哈希校验」共用 MD5）显示状态：内置、未安装、版本未知、不受支持、最新、可更新；本地哈希不在服务器列表中视为不受支持（服务器会拒绝其成绩）。
- 下载更新通过服务器给出的 `download_url`
  进行（经确认对话框），安装到本地后下次启动生效。

::: details 开发者参考

实现要点：私有端点继承 `PrivateAPIRequest`（走 `/private`
路由）；用服务器给出的「版本 → MD5」映射与本地程序集哈希比对，即可判定本地版本。

1. 列表与版本两个私有端点（g0v0! 见
   `osu.Game/Online/API/Requests/Private/SupportedRulesetsRequest.cs`、
   `SupportedRulesetVersionsRequest.cs`）：

   ```csharp
   public class SupportedRulesetsRequest : PrivateAPIRequest<SupportedRulesetsResponse>
   {
       protected override string Target => @"gamemodes";
   }
   ```

2. 本地版本判定：把本地 ruleset 程序集的 MD5（见「ruleset 哈希校验」一节）与
   `versions` 映射逐项比对得出当前版本，再与 `latest_version`
   比较得到最新 / 可更新状态（g0v0! 见
   `osu.Game/Overlays/Settings/Sections/RulesetGeneric/OnlineRulesetRow.cs` 的
   `resolveState()`）。
3. 下载按 `download_url`
   直接进行（普通文件下载，安装到 ruleset 存储，下次启动生效；g0v0! 见
   `OnlineRulesetRow.startDownload()`）。

:::

## 服务器信息通知

- 客户端启动约 2 秒后，会显示一条通知，展示当前连接的服务器（官方端点显示「官方服务器」，未自定义时显示「已连接到默认服务器」，其余显示主机名）。纯本地展示，不产生额外请求。

## 问题反馈

- 「报告问题」按钮在跳转到 GooGuTeam 的 GitHub
  Issues 页面之前，会先弹出确认对话框。
- 设置的快速操作中也提供「报告问题」入口，直接打开
  [GooGuTeam/g0v0](https://github.com/GooGuTeam/g0v0/issues) 的 Issues 页面。

## 更新源

- 更新通道为 **g0v0**（稳定）与
  **robin**（不稳定），选择 robin 时检查预发布版本（桌面端首次运行时按安装包版本自动选择通道）。<Badge type="robin" text="v2026.1012.1-robin" />
- iOS 安装包直接发布在 Release 页面，更新通知会打开对应的 Release 页面（不再使用 TestFlight 链接）。
- 更新设置中新增了「禁用自动更新」选项。

## 错误上报

- 客户端崩溃报告会发送到 GooGuTeam 托管的 Glitchtip 实例（仅连接官方服务器时启用），而不是上游的 Sentry 端点。

## 奖章系统

- 全新的勋章授予器框架（`MedalAwarderContainer`），内置多个授予器：Courier
  Catapult、Cyclone、g0v0! 一周年（G0V0 First Anniversary）、Hamster
  Wheel、Hotshot。
- `g0v0_` 前缀勋章的图片从 `lazer-data.g0v0.top` 加载。

## WASAPI 音频 <Badge type="g0v0" text="v2026.1012.0-g0v0" />

- 客户端强制启用 WASAPI 音频输出（取代原先的「实验性 WASAPI」标记）。
- **设置 → 音频 → 设备**
  中新增 WASAPI 设置分组（启用 WASAPI 时显示；该组文案暂无中文翻译）：
  - **Exclusive audio
    mode**：绕过系统混音器以获得最低音频延迟；开启后其他应用无法同时播放音频；
  - **Buffer size (s)**：音频缓冲区长度，设为 `0`
    使用设备支持的最低缓冲；出现爆音或卡顿时调大；
  - **Period (s)**：音频更新的轮询间隔，设为 `0`
    请求设备支持的最低周期；播放不稳定时调大；
  - **Auto switch to shared audio in
    background**：游戏失去焦点时自动退出独占模式、切回共享模式；
  - **Restart audio engine** 按钮：修改设置后立即重启音频引擎使其生效。

## Score V1 / Score V2 计分 <Badge type="g0v0" text="v2026.1012.0-g0v0" />

- osu! 规则集新增 **Score V1（SV1）** 与 **Score V2（SV2）**
  两个转换 mod（互斥），单人游戏与多人房间（普通 mod 或自由 mod）均可使用。
- Score
  V1 按 osu!stable 方式计分：滑条采用 classic 行为与判定，转盘按 stable 规则计分；autoplay 生成的回放中滑条与转盘得分与 stable 一致。
- Score
  V2 使用 V2 计分算法游玩：在 classic 滑条行为之上计分，包含转盘准确率与 classic 滑条输入追踪的改进。
- osu! 规则集设置新增「显示滑条头判定」开关。

## V2 成绩界面 <Badge type="g0v0" text="v2026.1012.0-g0v0" />

- 客户端内置重新设计的成绩界面（样式名 **g0v0!
  V2**，默认关闭），与默认、Torii（旧版）样式一起在
  **设置 → 用户界面 → 成绩界面样式** 中切换。
- 成绩展示大幅重排：准确率环与排名徽记（带环形动画与音效）、相对上一笔成绩的 PP 变化量与连击 / 准确率等统计增减对比，以及成绩 flair 动画。
- FC /
  SS 预估：未满连击的成绩会显示「若 FC 可得的 PP」预估，已 FC 的成绩显示 SS 预估；点击预估可在 SS
  / SSH 之间切换（使用 Hidden 时），并带悬浮提示。

## Torii 旧版界面 <Badge type="g0v0" text="v2026.1012.0-g0v0" />

- 客户端内置从 [Torii](https://github.com/ShikkesoraSIM/torii-osu)（MIT
  License，固定移植特定版本）移植的旧版界面组件：旧版选歌界面与底部按钮栏，以及旧版结算界面（含旧版排名详情面板）。
- 结算界面样式可在 **设置 → 用户界面 → 成绩界面样式** 中切换（默认 / g0v0! V2 /
  Torii（旧版））；旧版选歌相关开关位于 **设置 → 用户界面 → 歌曲选择外观**
  小节（旧版歌曲选择、Inter 字体等）。

## 品牌与界面

- 客户端名称、图标与进程名更改为 g0v0!（开发版为 `g0v0-development`），主题色为
  `#5ca9e5`；启动时显示 g0v0! 的说明页（Disclaimer）。
- 新增 MapleMono、KTXPYingRound、MgenPlus 等字体。
- 默认以全屏启动（性能与体验考虑）。
- 系统兼容性提示（如最低需要 Windows 8.1）与单实例限制提示均更新为 g0v0! 文案。
- 歌选底栏新增弹出按钮组件（`FooterPopoverButton`）；编辑器 stack
  leniency 的说明文案也已修正。
- 聊天消息中被提及（@）的匹配按 Unicode 词边界处理，正确支持 CJK 等非 ASCII 用户名（配合 g0v0-server 的 Unicode 用户名验证）。
