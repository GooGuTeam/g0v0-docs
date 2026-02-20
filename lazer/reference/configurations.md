<script setup lang="ts">
import { computed } from 'vue';
import { data } from './configuration.data.ts';

const sections = computed(() => {
  const result = {};
  for (const key in data.definition) {
    if (key.startsWith('$')) continue;
    result[key] = data.definition[key];
  }
  return result;
});

const commitUrl = computed(() => {
  return `https://github.com/GooGuTeam/g0v0-server/commit/${data.definition.$commit}`;
})
</script>

# 配置

本页面列出了所有在 `.env` 文件中可用的配置选项及其说明。

::: warning 警告

在生产环境中，请务必更改默认的密钥和密码！

:::

:::tip 文档贡献者提示

此文件是自动生成的，任何更改都将被覆盖。如果你想要更改翻译，请在
`data/configuration/zh-CN.js` 中修改。

上次生成于 <code>{{ data.definition.$timestamp }}</code>
(提交：<code><a :href="commitUrl">{{ data.definition.$commit }}</a></code>)。

:::

<div v-for="(value, key) in sections">
    <h2>{{ data.trans[key]?.$name || "<尚未翻译>" }}</h2>
    <div v-if="data.trans[key]?.$description" v-html="data.trans[key]?.$description"></div>
    <table>
        <thead>
            <tr>
                <th>配置项</th>
                <th>描述</th>
                <th>类型</th>
                <th>默认值</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="(cvalue, ckey) in value">
                <td><code>{{ ckey }}</code> <p v-for="alias in cvalue.$aliases" :key="alias" v-if="cvalue.$aliases && cvalue.$aliases.length">(<code>{{ alias }}</code>)</p></td>
                <td>{{ data.trans[key]?.[ckey] || "<尚未翻译>" }}</td>
                <td>{{ cvalue.$type || "<暂无类型>" }}</td>
                <td><code>{{ cvalue.$type === "string" && cvalue.$default === "" ? `""` : (cvalue.$default === null ? "null" : cvalue.$default) }}</code></td>
            </tr>
        </tbody>
    </table>
</div>
