# 内置事件

所有事件均继承自 `PluginEvent` 基类。

## 基类

### PluginEvent

所有插件事件的基类，继承自 `pydantic.BaseModel`。

```python
from app.models.events import PluginEvent
```

---

## 用户事件

### UserRegisteredEvent

**触发条件**：用户注册账号时触发。

| 字段           | 类型  | 说明          |
| -------------- | ----- | ------------- |
| `user_id`      | `int` | 用户 ID       |
| `username`     | `str` | 用户名        |
| `country_code` | `str` | 国家/地区代码 |

---

## 聊天事件

### MessageSentEvent

**触发条件**：用户在聊天中发送消息时触发。

| 字段              | 类型          | 说明            |
| ----------------- | ------------- | --------------- |
| `sender_id`       | `int`         | 发送者用户 ID   |
| `channel_id`      | `int`         | 频道 ID         |
| `message_content` | `str`         | 消息内容        |
| `timestamp`       | `datetime`    | 发送时间        |
| `type`            | `MessageType` | 消息类型        |
| `is_bot_command`  | `bool`        | 是否为 Bot 命令 |

### JoinChannelEvent

**触发条件**：用户加入聊天频道时触发。

| 字段         | 类型  | 说明    |
| ------------ | ----- | ------- |
| `user_id`    | `int` | 用户 ID |
| `channel_id` | `int` | 频道 ID |

### LeaveChannelEvent

**触发条件**：用户离开聊天频道时触发。

| 字段         | 类型  | 说明    |
| ------------ | ----- | ------- |
| `user_id`    | `int` | 用户 ID |
| `channel_id` | `int` | 频道 ID |

---

## 成绩事件

### ScoreCreatedEvent

**触发条件**：创建新成绩时触发。

| 字段           | 类型        | 说明       |
| -------------- | ----------- | ---------- |
| `user_id`      | `int`       | 用户 ID    |
| `beatmap_id`   | `int`       | 谱面 ID    |
| `beatmap_hash` | `str`       | 谱面哈希值 |
| `gamemode`     | `GameMode`  | 游戏模式   |
| `score_token`  | `int`       | 成绩 Token |
| `score_type`   | `ScoreType` | 成绩类型   |

### SoloScoreCreatedEvent

**继承自**：`ScoreCreatedEvent`

**触发条件**：创建新的单人游戏成绩时触发。

| 字段         | 类型        | 说明                    |
| ------------ | ----------- | ----------------------- |
| `score_type` | `ScoreType` | 固定为 `ScoreType.SOLO` |

### MultiplayerScoreCreatedEvent

**继承自**：`ScoreCreatedEvent`

**触发条件**：创建新的多人游戏成绩时触发。

| 字段          | 类型        | 说明                           |
| ------------- | ----------- | ------------------------------ |
| `score_type`  | `ScoreType` | 固定为 `ScoreType.MULTIPLAYER` |
| `room_id`     | `int`       | 房间 ID                        |
| `playlist_id` | `int`       | 游玩列表 ID                    |

### ScoreSubmittedEvent

**触发条件**：成绩被提交处理时触发。

| 字段              | 类型                      | 说明     |
| ----------------- | ------------------------- | -------- |
| `user_id`         | `int`                     | 用户 ID  |
| `submission_info` | `SoloScoreSubmissionInfo` | 提交信息 |
| `score_type`      | `ScoreType`               | 成绩类型 |

### SoloScoreSubmittedEvent

**继承自**：`ScoreSubmittedEvent`

**触发条件**：单人游戏成绩被提交处理时触发。

| 字段         | 类型        | 说明                    |
| ------------ | ----------- | ----------------------- |
| `score_type` | `ScoreType` | 固定为 `ScoreType.SOLO` |

### MultiplayerScoreSubmittedEvent

**继承自**：`ScoreSubmittedEvent`

**触发条件**：多人游戏成绩被提交处理时触发。

| 字段          | 类型        | 说明                           |
| ------------- | ----------- | ------------------------------ |
| `score_type`  | `ScoreType` | 固定为 `ScoreType.MULTIPLAYER` |
| `room_id`     | `int`       | 房间 ID                        |
| `playlist_id` | `int`       | 游玩列表 ID                    |

### ScoreProcessedEvent

**触发条件**：成绩处理完成时触发。

| 字段       | 类型  | 说明    |
| ---------- | ----- | ------- |
| `score_id` | `int` | 成绩 ID |

### ScoreDeletedEvent

**触发条件**：成绩被删除时触发。

| 字段       | 类型  | 说明    |
| ---------- | ----- | ------- |
| `score_id` | `int` | 成绩 ID |

### ReplayUploadedEvent

**触发条件**：回放文件被上传时触发。

| 字段               | 类型    | 说明          |
| ------------------ | ------- | ------------- |
| `score_id`         | `int`   | 成绩 ID       |
| `uploader_user_id` | `int`   | 上传者用户 ID |
| `file_path`        | `str`   | 文件路径      |
| `replay_data`      | `bytes` | 回放数据      |

### ReplayDownloadedEvent

**触发条件**：回放文件被下载时触发。

| 字段                 | 类型          | 说明                  |
| -------------------- | ------------- | --------------------- |
| `score_id`           | `int`         | 成绩 ID               |
| `owner_user_id`      | `int`         | 回放所有者用户 ID     |
| `downloader_user_id` | `int \| None` | 下载者用户 ID（可选） |

---

## 谱面获取事件

### FetchingBeatmapRawEvent

**触发条件**：开始获取原始谱面内容（.osu 文件）时触发。

| 字段         | 类型  | 说明    |
| ------------ | ----- | ------- |
| `beatmap_id` | `int` | 谱面 ID |

### BeatmapRawFetchedEvent

**触发条件**：成功获取原始谱面内容后触发。

| 字段          | 类型  | 说明         |
| ------------- | ----- | ------------ |
| `beatmap_id`  | `int` | 谱面 ID      |
| `beatmap_raw` | `str` | 原始谱面内容 |

### FetchingBeatmapEvent

**触发条件**：开始从 API 获取谱面数据时触发。

| 字段               | 类型          | 说明               |
| ------------------ | ------------- | ------------------ |
| `beatmap_id`       | `int \| None` | 谱面 ID（可选）    |
| `beatmap_checksum` | `str \| None` | 谱面校验和（可选） |

### BeatmapFetchedEvent

**触发条件**：成功从 API 获取谱面数据后触发。

| 字段           | 类型   | 说明     |
| -------------- | ------ | -------- |
| `beatmap_id`   | `int`  | 谱面 ID  |
| `beatmap_data` | `dict` | 谱面数据 |

### FetchingBeatmapsetEvent

**触发条件**：开始从 API 获取谱面集数据时触发。

| 字段            | 类型  | 说明      |
| --------------- | ----- | --------- |
| `beatmapset_id` | `int` | 谱面集 ID |

### BeatmapsetFetchedEvent

**触发条件**：成功从 API 获取谱面集数据后触发。

| 字段              | 类型   | 说明       |
| ----------------- | ------ | ---------- |
| `beatmapset_id`   | `int`  | 谱面集 ID  |
| `beatmapset_data` | `dict` | 谱面集数据 |

---

## PP 计算事件

### BeforeCalculatingPPEvent

**触发条件**：开始计算成绩的 PP 之前触发。

| 字段          | 类型  | 说明         |
| ------------- | ----- | ------------ |
| `score_id`    | `int` | 成绩 ID      |
| `beatmap_raw` | `str` | 原始谱面内容 |

### AfterCalculatingPPEvent

**触发条件**：成绩的 PP 计算完成后触发。

| 字段                    | 类型                    | 说明         |
| ----------------------- | ----------------------- | ------------ |
| `score_id`              | `int`                   | 成绩 ID      |
| `beatmap_raw`           | `str`                   | 原始谱面内容 |
| `performance_attribute` | `PerformanceAttributes` | 表现属性     |

---

## HTTP 事件

### RequestReceivedEvent

**触发条件**：服务器收到 HTTP 请求时触发。

| 字段      | 类型      | 说明               |
| --------- | --------- | ------------------ |
| `time`    | `float`   | 请求接收时间       |
| `request` | `Request` | Starlette 请求对象 |

### RequestHandledEvent

**触发条件**：HTTP 请求处理完成时触发。

| 字段       | 类型      | 说明               |
| ---------- | --------- | ------------------ |
| `time`     | `float`   | 请求处理完成时间   |
| `request`  | `Request` | Starlette 请求对象 |
| `response` | `Any`     | 响应对象           |

---

## 枚举类型

### ScoreType

成绩类型枚举。

| 值            | 说明     |
| ------------- | -------- |
| `SOLO`        | 单人游戏 |
| `MULTIPLAYER` | 多人游戏 |
