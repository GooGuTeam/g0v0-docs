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

# Configurations

This page lists all available configuration options in the `.env` file and their
descriptions.

::: warning Warning

In a production environment, be sure to change the default keys and passwords!

:::

:::tip Documentation Contributor Tip

This file is auto-generated, and any changes will be overwritten. If you want to
modify the translation, please edit `data/configuration/en.js`.

Last generated on <code>{{ data.definition.$timestamp }}</code> (commit:
<code><a :href="commitUrl">{{ data.definition.$commit }}</a></code>).

:::

<div v-for="(value, key) in sections">
    <h2>{{ data.trans[key]?.$name || "<Not Translated>" }}</h2>
    <div v-if="data.trans[key]?.$description" v-html="data.trans[key]?.$description"></div>
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
            <tr v-for="(cvalue, ckey) in value">
                <td><code>{{ ckey }}</code> <p v-for="alias in cvalue.$aliases" :key="alias" v-if="cvalue.$aliases && cvalue.$aliases.length">(<code>{{ alias }}</code>)</p></td>
                <td>{{ data.trans[key]?.[ckey] || "<Not Translated>" }}</td>
                <td>{{ cvalue.$type || "<No Type>" }}</td>
                <td><code>{{ cvalue.$type === "string" && cvalue.$default === "" ? `""` : (cvalue.$default === null ? "null" : cvalue.$default) }}</code></td>
            </tr>
        </tbody>
    </table>
</div>
