# Built-in Events

All events inherit from the `PluginEvent` base class.

## Base Class

### PluginEvent

Base class for all plugin events, inherits from `pydantic.BaseModel`.

```python
from app.models.events import PluginEvent
```

---

## User Events

### UserRegisteredEvent

**Trigger**: Triggered when a user registers an account.

| Field          | Type  | Description         |
| -------------- | ----- | ------------------- |
| `user_id`      | `int` | User ID             |
| `username`     | `str` | Username            |
| `country_code` | `str` | Country/Region Code |

---

## Chat Events

### MessageSentEvent

**Trigger**: Triggered when a user sends a message in chat.

| Field             | Type          | Description     |
| ----------------- | ------------- | --------------- |
| `sender_id`       | `int`         | Sender user ID  |
| `channel_id`      | `int`         | Channel ID      |
| `message_content` | `str`         | Message content |
| `timestamp`       | `datetime`    | Send time       |
| `type`            | `MessageType` | Message type    |
| `is_bot_command`  | `bool`        | Is bot command  |

### JoinChannelEvent

**Trigger**: Triggered when a user joins a chat channel.

| Field        | Type  | Description |
| ------------ | ----- | ----------- |
| `user_id`    | `int` | User ID     |
| `channel_id` | `int` | Channel ID  |

### LeaveChannelEvent

**Trigger**: Triggered when a user leaves a chat channel.

| Field        | Type  | Description |
| ------------ | ----- | ----------- |
| `user_id`    | `int` | User ID     |
| `channel_id` | `int` | Channel ID  |

---

## Score Events

### ScoreCreatedEvent

**Trigger**: Triggered when a new score is created.

| Field          | Type        | Description  |
| -------------- | ----------- | ------------ |
| `user_id`      | `int`       | User ID      |
| `beatmap_id`   | `int`       | Beatmap ID   |
| `beatmap_hash` | `str`       | Beatmap hash |
| `gamemode`     | `GameMode`  | Game mode    |
| `score_token`  | `int`       | Score token  |
| `score_type`   | `ScoreType` | Score type   |

### SoloScoreCreatedEvent

**Inherits from**: `ScoreCreatedEvent`

**Trigger**: Triggered when a new solo score is created.

| Field        | Type        | Description               |
| ------------ | ----------- | ------------------------- |
| `score_type` | `ScoreType` | Fixed to `ScoreType.SOLO` |

### MultiplayerScoreCreatedEvent

**Inherits from**: `ScoreCreatedEvent`

**Trigger**: Triggered when a new multiplayer score is created.

| Field         | Type        | Description                      |
| ------------- | ----------- | -------------------------------- |
| `score_type`  | `ScoreType` | Fixed to `ScoreType.MULTIPLAYER` |
| `room_id`     | `int`       | Room ID                          |
| `playlist_id` | `int`       | Playlist ID                      |

### ScoreSubmittedEvent

**Trigger**: Triggered when a score is submitted for processing.

| Field             | Type                      | Description     |
| ----------------- | ------------------------- | --------------- |
| `user_id`         | `int`                     | User ID         |
| `submission_info` | `SoloScoreSubmissionInfo` | Submission info |
| `score_type`      | `ScoreType`               | Score type      |

### SoloScoreSubmittedEvent

**Inherits from**: `ScoreSubmittedEvent`

**Trigger**: Triggered when a solo score is submitted for processing.

| Field        | Type        | Description               |
| ------------ | ----------- | ------------------------- |
| `score_type` | `ScoreType` | Fixed to `ScoreType.SOLO` |

### MultiplayerScoreSubmittedEvent

**Inherits from**: `ScoreSubmittedEvent`

**Trigger**: Triggered when a multiplayer score is submitted for processing.

| Field         | Type        | Description                      |
| ------------- | ----------- | -------------------------------- |
| `score_type`  | `ScoreType` | Fixed to `ScoreType.MULTIPLAYER` |
| `room_id`     | `int`       | Room ID                          |
| `playlist_id` | `int`       | Playlist ID                      |

### ScoreProcessedEvent

**Trigger**: Triggered when score processing is complete.

| Field      | Type  | Description |
| ---------- | ----- | ----------- |
| `score_id` | `int` | Score ID    |

### ScoreDeletedEvent

**Trigger**: Triggered when a score is deleted.

| Field      | Type  | Description |
| ---------- | ----- | ----------- |
| `score_id` | `int` | Score ID    |

### ReplayUploadedEvent

**Trigger**: Triggered when a replay file is uploaded.

| Field              | Type    | Description      |
| ------------------ | ------- | ---------------- |
| `score_id`         | `int`   | Score ID         |
| `uploader_user_id` | `int`   | Uploader user ID |
| `file_path`        | `str`   | File path        |
| `replay_data`      | `bytes` | Replay data      |

### ReplayDownloadedEvent

**Trigger**: Triggered when a replay file is downloaded.

| Field                | Type          | Description                   |
| -------------------- | ------------- | ----------------------------- |
| `score_id`           | `int`         | Score ID                      |
| `owner_user_id`      | `int`         | Replay owner user ID          |
| `downloader_user_id` | `int \| None` | Downloader user ID (optional) |

---

## Beatmap Fetch Events

### FetchingBeatmapRawEvent

**Trigger**: Triggered when starting to fetch raw beatmap content (.osu file).

| Field        | Type  | Description |
| ------------ | ----- | ----------- |
| `beatmap_id` | `int` | Beatmap ID  |

### BeatmapRawFetchedEvent

**Trigger**: Triggered after successfully fetching raw beatmap content.

| Field         | Type  | Description         |
| ------------- | ----- | ------------------- |
| `beatmap_id`  | `int` | Beatmap ID          |
| `beatmap_raw` | `str` | Raw beatmap content |

### FetchingBeatmapEvent

**Trigger**: Triggered when starting to fetch beatmap data from API.

| Field              | Type          | Description                 |
| ------------------ | ------------- | --------------------------- |
| `beatmap_id`       | `int \| None` | Beatmap ID (optional)       |
| `beatmap_checksum` | `str \| None` | Beatmap checksum (optional) |

### BeatmapFetchedEvent

**Trigger**: Triggered after successfully fetching beatmap data from API.

| Field          | Type   | Description  |
| -------------- | ------ | ------------ |
| `beatmap_id`   | `int`  | Beatmap ID   |
| `beatmap_data` | `dict` | Beatmap data |

### FetchingBeatmapsetEvent

**Trigger**: Triggered when starting to fetch beatmapset data from API.

| Field           | Type  | Description   |
| --------------- | ----- | ------------- |
| `beatmapset_id` | `int` | Beatmapset ID |

### BeatmapsetFetchedEvent

**Trigger**: Triggered after successfully fetching beatmapset data from API.

| Field             | Type   | Description     |
| ----------------- | ------ | --------------- |
| `beatmapset_id`   | `int`  | Beatmapset ID   |
| `beatmapset_data` | `dict` | Beatmapset data |

---

## PP Calculation Events

### BeforeCalculatingPPEvent

**Trigger**: Triggered before starting to calculate PP for a score.

| Field         | Type  | Description         |
| ------------- | ----- | ------------------- |
| `score_id`    | `int` | Score ID            |
| `beatmap_raw` | `str` | Raw beatmap content |

### AfterCalculatingPPEvent

**Trigger**: Triggered after PP calculation for a score is complete.

| Field                   | Type                    | Description            |
| ----------------------- | ----------------------- | ---------------------- |
| `score_id`              | `int`                   | Score ID               |
| `beatmap_raw`           | `str`                   | Raw beatmap content    |
| `performance_attribute` | `PerformanceAttributes` | Performance attributes |

---

## HTTP Events

### RequestReceivedEvent

**Trigger**: Triggered when the server receives an HTTP request.

| Field     | Type      | Description              |
| --------- | --------- | ------------------------ |
| `time`    | `float`   | Request received time    |
| `request` | `Request` | Starlette request object |

### RequestHandledEvent

**Trigger**: Triggered when HTTP request processing is complete.

| Field      | Type      | Description              |
| ---------- | --------- | ------------------------ |
| `time`     | `float`   | Request handled time     |
| `request`  | `Request` | Starlette request object |
| `response` | `Any`     | Response object          |

---

## Enum Types

### ScoreType

Score type enum.

| Value         | Description |
| ------------- | ----------- |
| `SOLO`        | Solo game   |
| `MULTIPLAYER` | Multiplayer |
