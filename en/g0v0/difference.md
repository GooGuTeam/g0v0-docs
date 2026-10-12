---
---

# Differences from osu!(lazer)

g0v0! is built on the open-source codebase of
[ppy/osu](https://github.com/ppy/osu) (osu!lazer). Apart from the changes listed
below, all gameplay, UI, and framework behaviour remains identical to upstream;
every change exists to work with [g0v0-server](/en/lazer/). The following is
based on
[v2026.1012.1-robin](https://github.com/GooGuTeam/g0v0/releases/tag/v2026.1012.1-robin).

## The g0v0! Standard

The sections carrying the <Badge type="standard" text="g0v0! Standard" /> marker
below together form a set of server extension conventions defined by
g0v0-server. **Any client that implements the g0v0! Standard is fully compatible
with every g0v0!-based server.** g0v0! is the reference implementation of the
g0v0! Standard.

The g0v0! Standard only covers **the parts that talk to the server**. Compared
with vanilla osu!(lazer) communication, g0v0! adds:

| Area                | Vanilla osu!(lazer)                         | g0v0!                                                                                                                                                                    |
| :------------------ | :------------------------------------------ | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| API / Web endpoints | Hard-coded to ppy servers, not configurable | Customisable in the settings; a single URL derives every endpoint                                                                                                        |
| SignalR connections | Client version hash header                  | Additionally carries the `X-Osu-Ruleset-Hashes` header                                                                                                                   |
| Score submission    | Client version hash                         | Additionally carries the `ruleset_hash` parameter                                                                                                                        |
| Ruleset set         | Official 4 rulesets (OnlineID 0–3)          | Plus `osurx` / `osuap` / `taikorx` / `fruitsrx` (4–7) with separate statistics and rankings; custom rulesets can be registered, validated, and distributed by the server |
| Multiplayer rooms   | No win condition on playlist items          | New `win_condition` field                                                                                                                                                |
| Private API         | None                                        | `/private` route (g0v0! API) and extended endpoints                                                                                                                      |

The "Developer reference" collapsible in each section below is written for
client developers who want to implement the g0v0! Standard: it explains what
needs to change for server communication and how.

## Custom API server <Badge type="standard" text="g0v0! Standard" />

- Players can specify a "Custom API server URL" in **Settings > Online > Content
  downloads** to connect to third-party servers.
- A single custom URL replaces both the API and Website endpoints and derives
  every realtime endpoint: `/signalr/spectator`, `/signalr/multiplayer`,
  `/signalr/metadata`, and `/beatmap-submission`, matching the g0v0-server
  deployment layout one to one (upstream hard-codes these to ppy servers).
- The settings UI validates the URL (invalid input gets a notice) and shows a
  restart-required notice; a missing protocol scheme gets `https://` prepended.
- Online resources (skins, preview tracks, etc.) go through a trusted-domain
  filter: lookups are allowed when a custom server is configured, otherwise only
  `.ppy.sh` / `.g0v0.top` hosts are allowed and other external requests are
  blocked.
- The client's default production endpoints are the official g0v0 instance
  (`lazer.g0v0.top` / `lazer-api.g0v0.top`).

::: details Developer reference

Key idea: keep one configurable base URL and derive every endpoint from it when
building the endpoint configuration; changes apply after a restart.

1. When building the endpoint configuration, replace the API and Website
   endpoints with it and derive the realtime endpoints by convention (g0v0!:
   `CreateEndpoints()` in `osu.Game/OsuGameBase.cs`):

   ```csharp
   config.APIUrl = customUrl;
   config.WebsiteUrl = customUrl;
   config.SpectatorUrl = $"{customUrl}/signalr/spectator";
   config.MultiplayerUrl = $"{customUrl}/signalr/multiplayer";
   config.MetadataUrl = $"{customUrl}/signalr/metadata";
   config.BeatmapSubmissionServiceUrl = $"{customUrl}/beatmap-submission";
   ```

2. The paths mirror a g0v0-server deployment: the API lives at the server root,
   SignalR under `/signalr/*`, and beatmap submission under
   `/beatmap-submission`; authentication keeps using the standard osu! API v2
   OAuth flow (client credentials come with the endpoint configuration).
3. Trusted-domain filtering must be adjusted: allow non-`ppy.sh` hosts (i.e. the
   custom server's domain), otherwise online resources such as skins and preview
   tracks fail to load (g0v0!: `osu.Game/Online/TrustedDomainOnlineStore.cs` and
   `osu.Game/Audio/PreviewTrackManager.cs`; its own choice is to allow all
   lookups once a custom server is configured). Optional hardening: allow only
   the additional `.g0v0.top` domain.
4. (Optional) Add a config key holding the base URL (g0v0!:
   `OsuSetting.CustomApiUrl` in `osu.Game/Configuration/OsuConfigManager.cs`).

:::

## Special rulesets (Relax / Autopilot) <Badge type="standard" text="g0v0! Standard" />

- First-class support for **Relax (RX)** and **Autopilot (AP)** as special game
  modes.
- Ruleset identifiers agreed with g0v0-server: `osurx` (4), `osuap` (5),
  `taikorx` (6), and `fruitsrx` (7), matching official osu! / taiko / catch
  (0–2).
- When playing a base ruleset with the Relax / Autopilot mods enabled, scores
  and statistics are handled under the identity of the corresponding special
  ruleset.
- Dedicated difficulty and performance (PP) calculators for the Relax mode,
  including a standalone `RelaxAimEvaluator`, `RelaxRhythmEvaluator`, and the
  Relax difficulty skill.
- The ruleset selectors in the profile and overlay display special rulesets with
  a popover menu, and user statistics are fetched per special ruleset.

::: details Developer reference

Key idea: a special ruleset is an online identity derived from an official
ruleset by changing its short name and ID. All communication still goes through
the standard osu! API v2 endpoints — no private route is required.

1. Reserve the agreed short names and OnlineIDs (g0v0!: the constants and
   `CreateSpecialRuleset()` in `osu.Game/Rulesets/RulesetInfo.cs`):

   ```csharp
   public const string OSU_RELAX_MODE_SHORTNAME = "osurx";
   public const int OSU_RELAX_ONLINE_ID = 4; // others: osuap=5, taikorx=6, fruitsrx=7
   ```

2. For scores submitted and statistics queried with a base ruleset plus the
   Relax / Autopilot mods, map to the special ruleset identity first, then hit
   the standard endpoints — the server records statistics and rankings in
   separate pools (g0v0!: `CreateSpecialRulesetByScore()`,
   `osu.Game/Online/LocalUserStatisticsProvider.cs`,
   `osu.Game/Online/UserStatisticsWatcher.cs`).

:::

## Ruleset hash validation <Badge type="standard" text="g0v0! Standard" />

- On startup, the client computes MD5 hashes of the assembly files of every
  ruleset beyond the official four, cached by short name.
- Every SignalR connection (spectator / multiplayer / metadata / notifications,
  etc.) additionally carries the `X-Osu-Ruleset-Hashes` header (JSON:
  `{ shortName: md5 }`) on top of the existing `X-Osu-Version-Hash` header,
  enabling server-side integrity verification.
- Score submission (solo and room playlists) additionally carries a
  `ruleset_hash` query parameter on top of the existing version hash (only sent
  when the current ruleset is a custom one).
- When server-side integrity validation of these hashes fails (a ruleset is
  missing, unsupported, or outdated), joining a multiplayer room is rejected,
  listing the offending rulesets and the server-side versions.
- **Settings > Rulesets > Online rulesets** compares the local installation
  against the server registry and shows each ruleset's state (built-in / not
  installed / unsupported / up to date / update available), with direct
  downloads available. <Badge type="g0v0" text="v2026.1012.0-g0v0" />

::: details Developer reference

Key idea: let the server identify the exact version of the custom rulesets the
client has loaded. There are two reporting points.

1. On startup, compute the MD5 of the assembly file of every non-official
   ruleset (OnlineID outside 0–3) and cache it by short name (g0v0!:
   `osu.Game/Rulesets/RulesetHashCache.cs`):

   ```csharp
   using var str = File.OpenRead(instance.GetType().Assembly.Location);
   RulesetsHashes[instance.ShortName] = str.ComputeMD5Hash();
   ```

2. Attach the `X-Osu-Ruleset-Hashes` header (a `{ shortName: md5 }` JSON object)
   to every SignalR handshake; the existing `X-Osu-Version-Hash` header stays
   unchanged (g0v0!: `osu.Game/Online/HubClientConnector.cs`):

   ```csharp
   options.Headers.Add("X-Osu-Ruleset-Hashes",
       JsonConvert.SerializeObject(rulesetHashCache.RulesetsHashes));
   ```

3. Add a `ruleset_hash` query parameter to score submission, sent only when the
   current ruleset is a custom one (g0v0!:
   `osu.Game/Online/Solo/CreateSoloScoreRequest.cs`,
   `osu.Game/Online/Rooms/CreateRoomScoreRequest.cs`):

   ```csharp
   if (!string.IsNullOrEmpty(rulesetHash))
       req.AddParameter("ruleset_hash", rulesetHash);
   ```

:::

## Multiplayer win conditions <Badge type="standard" text="g0v0! Standard" />

- Playlist / multiplayer room items gain a `win_condition` field (Score /
  Accuracy / Combo; the upstream protocol has no such field).
- In-room leaderboards are ordered by the selected win condition (with a
  tiebreaker rule), and the room footer offers a win-condition picker.

::: details Developer reference

Key idea: extend the upstream playlist protocol with one optional field — send
it when creating/editing rooms, restore it when receiving room state, and keep
local ordering consistent with the server's decision.

1. Define the `Score` / `Accuracy` / `Combo` enum, defaulting to `Score` (g0v0!:
   `osu.Game/Online/Multiplayer/WinCondition.cs`).
2. Serialise the field on room items (g0v0!:
   `osu.Game/Online/Rooms/PlaylistItem.cs`,
   `osu.Game/Online/Multiplayer/MultiplayerPlaylistItem.cs`):

   ```csharp
   [JsonProperty("win_condition")]
   public WinCondition? WinCondition { get; set; }
   ```

3. Order the room and spectator leaderboards by the field (with a tiebreaker) so
   the local ranking matches the server's decision (g0v0!:
   `osu.Game/Screens/Play/Leaderboards/MultiplayerLeaderboardProvider.cs`,
   `MultiSpectatorLeaderboardProvider.cs`).

:::

## g0v0! API <Badge type="standard" text="g0v0! Standard" />

- The `PrivateAPIRequest` base class targets the server's `/private` route and
  serves as the client-side entry point of the g0v0! API, providing private
  capabilities beyond the osu! API v2.
- Example osu! API extension: `PUT me/achievements/{id}` (medal unlocking, used
  together with the client's medal awarders).
- Example osu! API extension:
  `GET beatmaps/{beatmapId}/scores/users/{userId}/all` (all personal scores on
  one beatmap in a single request, so a PP best can be picked independently of
  score ordering on the results screen).
  <Badge type="g0v0" text="v2026.1012.0-g0v0" />

::: details Developer reference

Key idea: private operations go through the server's `/private` route, reusing
the osu! API v2 authentication and serialisation infrastructure; extensions to
the osu! API itself follow the upstream style and just add endpoints.

1. Define a request base class with a fixed route (g0v0!:
   `osu.Game/Online/API/PrivateAPIRequest.cs`):

   ```csharp
   public abstract class PrivateAPIRequest : APIRequest
   {
       protected override string Route => @"private";
   }
   ```

2. Implement osu! API extensions as regular API requests, e.g. medal unlocking
   via `PUT me/achievements/{id}` (g0v0!:
   `osu.Game/Online/API/Requests/UnlockMedalRequest.cs`).
3. Implement public query extensions the same way, e.g.
   `GET beatmaps/{beatmapId}/scores/users/{userId}/all?mode={shortName}` (g0v0!:
   `osu.Game/Online/API/Requests/GetBeatmapUserScoresRequest.cs`).

:::

## Custom ruleset management <Badge type="standard" text="g0v0! Standard" /> <Badge type="g0v0" text="v2026.1012.0-g0v0" />

- The server can register custom rulesets and their versions through the g0v0!
  API; the client uses this to list, validate, and download updates.
- Endpoints (on the `/private` route):
  - `GET private/gamemodes`: the list of game modes the server provides (`id`,
    `name`, `readable`, `is_official`, `is_custom_ruleset`), declaring whether
    Relax / Autopilot are supported (`enable_rx` / `enable_ap`);
  - `GET private/gamemodes/versions`: version info per custom ruleset
    (`latest_version`, `versions`: a mapping of version to assembly MD5, and
    `download_url`). Official modes ship with the client and never appear here.
- In **Settings > Rulesets > Online rulesets**, the client compares the local
  installation (sharing the MD5s of "Ruleset hash validation") with the server
  and shows a state per ruleset: built-in, not installed, version unknown,
  unsupported, up to date, update available. A local hash the server does not
  know is a hard failure (the server rejects scores set on it).
- Updates are downloaded from the server-provided `download_url` (after a
  confirmation dialog) and take effect on the next launch.

::: details Developer reference

Key idea: private endpoints inherit `PrivateAPIRequest` (the `/private` route);
match the server's version→MD5 mapping against local assembly hashes to resolve
the local version.

1. Two private endpoints for the list and versions (g0v0!:
   `osu.Game/Online/API/Requests/Private/SupportedRulesetsRequest.cs`,
   `SupportedRulesetVersionsRequest.cs`):

   ```csharp
   public class SupportedRulesetsRequest : PrivateAPIRequest<SupportedRulesetsResponse>
   {
       protected override string Target => @"gamemodes";
   }
   ```

2. Resolve the local version by comparing the local ruleset assembly MD5 (see
   "Ruleset hash validation") against the `versions` mapping entry by entry,
   then compare with `latest_version` for the up-to-date / update-available
   state (g0v0!: `resolveState()` in
   `osu.Game/Overlays/Settings/Sections/RulesetGeneric/OnlineRulesetRow.cs`).
3. Download straight from `download_url` (a plain file download, installed into
   ruleset storage, taking effect on next launch; g0v0!:
   `OnlineRulesetRow.startDownload()`).

:::

## Server info notification

- About 2 seconds after startup, a notification is displayed showing the
  currently connected server (the official endpoints show "official server", an
  uncustomised setup shows "connected to the default server", anything else
  shows the hostname). It is purely local and issues no extra requests.

## Issue reporting

- The "Report an issue" button opens a confirmation dialog before redirecting to
  the GooGuTeam GitHub Issues page.
- The settings quick actions also offer a "Report an issue" entry that opens the
  [GooGuTeam/g0v0](https://github.com/GooGuTeam/g0v0/issues) issue tracker.

## Update source

- Update streams are **g0v0** (stable) and **robin** (unstable); selecting robin
  checks pre-releases (the desktop client picks the stream automatically from
  the installer version on first run).
  <Badge type="robin" text="v2026.1012.1-robin" />
- Both desktop (Velopack) and mobile update checks point to the
  **GooGuTeam/g0v0** GitHub releases.
- iOS builds are published directly on the release page, and the update
  notification opens the corresponding release page (no more TestFlight link).
- A new **Disable automatic updates** option is available in the update
  settings.

## Error reporting

- Client-side crash reports are sent to a GooGuTeam-hosted Glitchtip instance
  (only when connected to the official server) instead of the upstream Sentry
  endpoint.

## Medal system

- A new medal awarder framework (`MedalAwarderContainer`) with several built-in
  awarders: Courier Catapult, Cyclone, g0v0! First Anniversary, Hamster Wheel,
  and Hotshot.
- Images for medals prefixed with `g0v0_` are loaded from `lazer-data.g0v0.top`.

## WASAPI audio <Badge type="g0v0" text="v2026.1012.0-g0v0" />

- The client force-enables WASAPI audio output (replacing the previous
  "experimental WASAPI" flag).
- The **Settings > Audio > Devices** block gains a WASAPI group (shown while
  WASAPI is enabled):
  - **Exclusive audio mode**: bypasses the system audio mixer for the lowest
    possible latency; other applications cannot play audio simultaneously;
  - **Buffer size (s)**: audio buffer length; set to `0` to use the lowest
    supported buffer size — increase it if audio stutters or drops out;
  - **Period (s)**: polling interval for audio updates; set to `0` to request
    the minimum supported device period — increase it if playback is unstable;
  - **Auto switch to shared audio in background**: automatically leaves
    exclusive mode and switches to shared mode when the game loses focus;
  - a **Restart audio engine** button applies the changes immediately.

## Score V1 / Score V2 scoring <Badge type="g0v0" text="v2026.1012.0-g0v0" />

- The osu! ruleset gains two new conversion mods, **Score V1 (SV1)** and **Score
  V2 (SV2)** (mutually exclusive), usable in solo play and in multiplayer rooms
  (as regular or free mods).
- Score V1 scores the osu!stable way: sliders use classic behaviour and
  judgement, spinners are scored by the stable rules, and autoplay replays match
  stable slider and spinner scores.
- Score V2 plays with the V2 scoring algorithm: scoring on top of classic slider
  behaviour, with improved spinner accuracy and classic slider input tracking.
- The osu! ruleset settings gain a "Show slider head judgements" toggle.

## V2 results screen <Badge type="g0v0" text="v2026.1012.0-g0v0" />

- The client ships a redesigned results screen (the **g0v0 V2** style, off by
  default), switchable together with the Default and Torii (Legacy) styles under
  **Settings > User Interface > Results screen style**.
- The layout is reworked: an accuracy ring and rank emblem (with ring animation
  and sound), PP change and combo / accuracy statistic changes relative to the
  previous play, and a score flair animation.
- FC / SS estimate: plays that are not a full combo show an "if FC" PP estimate,
  and already-FC'd plays show an SS estimate; the estimate is clickable to
  toggle between SS and SSH (when Hidden is enabled) and has tooltips.

## Torii legacy interface <Badge type="g0v0" text="v2026.1012.0-g0v0" />

- The client ships legacy interface components ported from
  [Torii](https://github.com/ShikkesoraSIM/torii-osu) (MIT licensed, pinned to a
  specific source revision): the legacy song select with its footer button bar,
  and the legacy results screen (including the legacy ranking details panel).
- The results screen style can be switched under **Settings > User Interface >
  Results screen style** (Default / g0v0 V2 / Torii (Legacy)); the legacy song
  select toggles live in the **Song Select Appearance** subsection of the user
  interface settings (legacy song select, Inter font, etc.).

## Branding and UI

- The client name, icon, and process name changed to g0v0! (`g0v0-development`
  for dev builds), with `#5ca9e5` as the theme colour; a g0v0! disclaimer screen
  is shown at startup.
- New fonts including MapleMono, KTXPYingRound, and MgenPlus.
- The game starts in fullscreen by default (for performance and predictability).
- System compatibility messages (such as the Windows 8.1 minimum requirement)
  and the single-instance notice use g0v0! wording.
- A popover button component (`FooterPopoverButton`) was added to the song
  select footer; the editor's stack leniency description text was also fixed.
- Mentions (@) in chat match on Unicode word boundaries, correctly supporting
  CJK and other non-ASCII usernames (in line with g0v0-server's Unicode username
  validation).
