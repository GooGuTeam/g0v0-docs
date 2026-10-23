<script setup lang="ts">
import { computed } from 'vue';
import { data } from './v2-configuration.data.ts';
import { buildV2Reference } from '../../.vitepress/theme/components/config-generator/config-model.ts';

const sections = computed(() => buildV2Reference(data.definition, data.trans));
</script>

# v2 配置

本页面列出了所有在 v2 服务的 `config/*.json`
配置文件中可用的配置选项及其说明。v1（`.env`）的配置项请参考[配置](/lazer/reference/configurations)。

::: warning 警告

在生产环境中，请务必更改默认的密钥和密码！

:::

:::tip 文档贡献者提示

此页面是自动生成的，任何更改都将被覆盖。如果你想要更改翻译，请在
`data/v2-configuration/zh-CN.js`
中修改。配置项的定义（路径、类型、默认值）位于同目录的
`data/v2-configuration/definitions/`
文件夹内，请勿在此页面中重复维护。点击左下角的 "在 GitHub 上编辑此页" 链接可以直接跳转到翻译文件的编辑页面。

:::

<div v-for="section in sections" :key="section.file">
    <h2>{{ section.title }}</h2>
    <div v-if="section.description" v-html="section.description"></div>
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
            <template v-for="group in section.groups" :key="group.title || section.file + '-main'">
                <tr v-if="group.title">
                    <td colspan="4"><strong>{{ group.title }}</strong></td>
                </tr>
                <tr v-for="field in group.fields" :key="(group.title || '') + field.path">
                    <td><code>{{ field.path }}</code></td>
                    <td>{{ field.description }}</td>
                    <td>{{ field.typeText || field.kind }}</td>
                    <td><code>{{ field.defaultText }}</code></td>
                </tr>
            </template>
        </tbody>
    </table>
</div>
