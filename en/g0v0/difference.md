---
---

# Differences from osu!(lazer)

g0v0! is built on the open-source codebase of
[ppy/osu](https://github.com/ppy/osu) (osu!lazer). Apart from the changes listed
below, all gameplay, UI, and framework behaviour remains identical to upstream;
every change exists to work with [g0v0-server](/en/lazer/). The following is
based on
[v2026.923.0-g0v0](https://github.com/GooGuTeam/g0v0/releases/tag/v2026.923.0-g0v0).

## The g0v0! Standard

The sections carrying the <Badge type="tip" text="g0v0! Standard" /> marker
below together form a set of server extension conventions defined by
g0v0-server. **Any client that implements the g0v0! Standard is fully compatible
with every g0v0!-based server.** g0v0! is the reference implementation of the
g0v0! Standard.

The g0v0! Standard only covers **the parts that talk to the server**. Compared
with vanilla osu!(lazer) communication, g0v0! adds:

| Area                | Vanilla osu!(lazer)                         | g0v0!                                                                                       |
| :------------------ | :------------------------------------------ | :------------------------------------------------------------------------------------------ |
| API / Web endpoints | Hard-coded to ppy servers, not configurable | Customisable in the settings; a single URL derives every endpoint                           |
| SignalR connections | Client version hash header                  | Additionally carries the `X-Osu-Ruleset-Hashes` header                                      |
| Score submission    | Client version hash                         | Additionally carries the `ruleset_hash` parameter                                           |
| Ruleset set         | Official 4 rulesets (OnlineID 0–3)          | Plus `osurx` / `osuap` / `taikorx` / `fruitsrx` (4–7) with separate statistics and rankings |
| Multiplayer rooms   | No win condition on playlist items          | New `win_condition` field                                                                   |
| Private API         | None                                        | `/private` route (g0v0! API) and extended endpoints                                         |

The "Developer reference" collapsible in each section below is written for
client developers who want to implement the g0v0! Standard: it explains what
needs to change for server communication and how.

## Custom API server <Badge type="tip" text="g0v0! Standard" />

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

## Special rulesets (Relax / Autopilot) <Badge type="tip" text="g0v0! Standard" />

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

## Ruleset hash validation <Badge type="tip" text="g0v0! Standard" />

- On startup, the client computes MD5 hashes of the assembly files of every
  ruleset beyond the official four, cached by short name.
- Every SignalR connection (spectator / multiplayer / metadata / notifications,
  etc.) additionally carries the `X-Osu-Ruleset-Hashes` header (JSON:
  `{ shortName: md5 }`) on top of the existing `X-Osu-Version-Hash` header,
  enabling server-side integrity verification.
- Score submission (solo and room playlists) additionally carries a
  `ruleset_hash` query parameter on top of the existing version hash (only sent
  when the current ruleset is a custom one).
- When the server reports a ruleset as outdated, players receive an in-game
  notification with a direct download link.

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

## Multiplayer win conditions <Badge type="tip" text="g0v0! Standard" />

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

## g0v0! API <Badge type="tip" text="g0v0! Standard" />

- The `PrivateAPIRequest` base class targets the server's `/private` route and
  serves as the client-side entry point of the g0v0! API, providing private
  capabilities beyond the osu! API v2.
- Example osu! API extension: `PUT me/achievements/{id}` (medal unlocking, used
  together with the client's medal awarders).

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

- Desktop update checks and mobile update notifications point to the
  **GooGuTeam/osu** GitHub repository.
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
