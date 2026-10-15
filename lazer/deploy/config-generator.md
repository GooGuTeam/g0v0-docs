<script setup lang="ts">
import ConfigGenerator from '../../.vitepress/theme/components/ConfigGenerator.vue';
import { data } from './config-generator.data.ts';
</script>

# 配置生成器

手动填写 [g0v0-server v1](https://github.com/GooGuTeam/g0v0-server) 的 `.env`
配置项，或 g0v0 server v2 的 `config/*.json` 配置项，并一键生成对应的配置文件。

整个生成过程完全在浏览器本地完成，你的配置（包括数据库密码、JWT 密钥等敏感信息）不会被上传到任何服务器。

<ConfigGenerator :schema="data" />

## 使用方法

1. 在页面顶部选择要生成的版本：「v1 配置（.env）」或「v2 配置（config/\*.json）」。
2. 展开分组并填写各项。所有选项都已预填默认值，改动过的选项会高亮显示。
   - v1：如果已经有
     `.env`，可以点击「导入 .env」把内容粘贴进来，直接在表单中修改。
   - v2：只需填写需要调整的项，其余保持默认即可。
3. 在页面底部的输出区域查看生成结果，点击「复制」「下载 .env」「下载」或「打包下载全部 (.zip)」保存。

## 注意事项

- v1 页面生成的 `.env` 可以直接放到 g0v0-server
  v1 部署的根目录。**生产环境请务必修改默认的密钥和密码。**
- v2 页面生成的
  `general.json`、`game.json`、`realtime.json`、`chat.json`、`storage.json`
  需要放入每个 v2 服务（例如 `g0v0.Server.Realtime`）的 `config/`
  目录。所有 v2 服务应共用同一份 `general.json` 与 `storage.json`。
- `UseLegacyDatabase` 为 `true` 时继续使用 v1 的 MySQL 数据库；改为 `false`
  时会使用 `PostgresqlConnectionString`
  指向的 PostgreSQL 数据库。表单只显示当前所选数据库对应的配置项（生成的
  `general.json` 中两者都会保留，方便随时切换）。
- `chat.json`
  是可选文件：不放入该文件时，所有聊天限制将使用来自 osu-web 的默认值。
- `.env`
  中各项的详细说明请参考[配置](/lazer/reference/configurations)；v2各字段的说明请参考
  [g0v0.Server.Realtime 的 README](https://github.com/GooGuTeam/g0v0.Server.Realtime#configure-the-realtime-server)。

## 与配置转换器的区别

本页面用于**手动**填写并生成配置，适合从零开始部署或只想修改少数选项的场景。如果你已经有一份完整的v1
`.env`，希望自动转换出 v2 所需的全部配置文件，请使用[配置转换器](/lazer/deploy/config-converter)。
