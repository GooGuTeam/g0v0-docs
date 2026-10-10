<script setup lang="ts">
import ConfigConverter from '../../.vitepress/theme/components/ConfigConverter.vue';
</script>

# 配置转换器

将 [g0v0-server v1](https://github.com/GooGuTeam/g0v0-server) 的 `.env`
配置文件一键转换为 g0v0 server v2 所需的一系列 `config/*.json`
配置文件，并支持打包下载。

整个转换过程完全在浏览器本地完成，你的配置（包括数据库密码、JWT 密钥等敏感信息）不会被上传到任何服务器。

<ConfigConverter />

## 使用方法

1. 把 v1 服务器根目录的 `.env` 内容粘贴到上方输入框，或点击「上传文件」选择
   `.env` 文件（也可以点击「载入示例」先试试效果）。
2. 检查生成的各个 JSON 文件（`general.json`、`game.json`、`realtime.json`、`chat.json`、`storage.json`）。
3. 点击「打包下载全部 (.zip)」，解压后把 `config/`
   目录整体放入 v2 服务端的工作目录（例如 `g0v0.Server.Realtime`）即可。

缺失的变量会自动使用 v2 的默认值；v1 中存在、但 v2 暂无对应项的变量会在下方列出，方便逐一确认。

## 注意事项

- `general.json` 中的 `UseLegacyDatabase` 默认为
  `true`（继续使用 v1 的 MySQL 数据库）。如果你打算使用 v2 全新的 PostgreSQL 数据库，请在「其他 v2 设置」折叠区中取消勾选该选项并填写
  `PostgresqlConnectionString`。
- `REDIS_URL` 会被转换为 v2 需要的 `host:port` 形式（自动去掉 `redis://`
  前缀与密码部分）。
- v2 独有的配置项（如 `realtime.json` 的回放上传并发数、多人游戏房间限制，
  `chat.json`
  的聊天限制）默认以默认值生成，可在输入框下方的「其他 v2 设置」折叠区中调整。字段的完整说明请参考
  [g0v0.Server.Realtime 的 README](https://github.com/GooGuTeam/g0v0.Server.Realtime#configure-the-realtime-server)。
- `config/chat.json`
  是可选文件：不放入该文件时，所有聊天限制将使用来自 osu-web 的默认值。

## 与 v2 其他服务的配合

本页面生成的配置适用于 g0v0 server v2 系列。v2的各个服务共享
`config/general.json`
中的数据库、JWT 与存储等基础配置，迁移时请确保每个服务使用同一份 `general.json`
与 `storage.json`。
