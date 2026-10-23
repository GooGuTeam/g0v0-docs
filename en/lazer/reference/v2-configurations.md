<script setup lang="ts">
import { computed } from 'vue';
import { data } from './v2-configuration.data.ts';
import { buildV2Reference } from '../../../.vitepress/theme/components/config-generator/config-model.ts';

const sections = computed(() => buildV2Reference(data.definition, data.trans));
</script>

# v2 Configurations

This page lists all configuration options available in the v2 services'
`config/*.json` configuration files and their descriptions. For the v1 (`.env`)
options, see [Configurations](/en/lazer/reference/configurations).

::: warning Warning

In a production environment, be sure to change the default keys and passwords!

:::

:::tip Documentation Contributor Tip

This page is auto-generated, and any changes will be overwritten. If you want to
modify the translation, please edit `data/v2-configuration/en.js`. The field
definitions (paths, types, defaults) live in the sibling
`data/v2-configuration/definitions/` directory — do not maintain them on this
page. Click the "Edit this page on GitHub" link at the bottom left to jump
directly to the editing page of the translation file.

:::

<div v-for="section in sections" :key="section.file">
    <h2>{{ section.title }}</h2>
    <div v-if="section.description" v-html="section.description"></div>
    <table>
        <thead>
            <tr>
                <th>Configuration</th>
                <th>Description</th>
                <th>Type</th>
                <th>Default</th>
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
