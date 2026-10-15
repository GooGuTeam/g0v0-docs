<script setup lang="ts">
/**
 * One editable configuration entry shared by the v1 and v2 panels of the
 * manual config generator.
 */

const props = defineProps<{
  modelValue: string | number | boolean
  kind: 'string' | 'int' | 'float' | 'bool' | 'enum' | 'json'
  label: string
  /** small monospace hint (the raw key / type) */
  hint?: string
  enumValues?: string[]
  placeholder?: string
  /** highlight the entry because its value differs from the default */
  changed?: boolean
}>()

const emit = defineEmits<{
  (event: 'update:modelValue', value: string | boolean): void
}>()

function onInput(event: Event) {
  emit('update:modelValue', (event.target as HTMLInputElement | HTMLTextAreaElement).value)
}

function onCheck(event: Event) {
  emit('update:modelValue', (event.target as HTMLInputElement).checked)
}
</script>

<template>
  <label
    class="cg-item"
    :class="[props.kind === 'bool' ? 'cg-check' : 'cg-field', { changed: props.changed }]"
  >
    <template v-if="props.kind === 'bool'">
      <input type="checkbox" :checked="props.modelValue === true" @change="onCheck" />
      <span class="cg-check-label">{{ props.label }}</span>
      <code v-if="props.hint" class="cg-key">{{ props.hint }}</code>
    </template>

    <template v-else>
      <span class="cg-label">
        <span>{{ props.label }}</span>
        <code v-if="props.hint" class="cg-key">{{ props.hint }}</code>
      </span>

      <select
        v-if="props.kind === 'enum'"
        class="cg-text"
        :value="String(props.modelValue)"
        @change="onInput"
      >
        <option v-for="value in props.enumValues" :key="value" :value="value">{{ value }}</option>
      </select>

      <textarea
        v-else-if="props.kind === 'json'"
        class="cg-text cg-textarea"
        rows="2"
        spellcheck="false"
        :placeholder="props.placeholder"
        :value="String(props.modelValue)"
        @input="onInput"
      ></textarea>

      <input
        v-else-if="props.kind === 'int' || props.kind === 'float'"
        class="cg-text"
        type="number"
        :step="props.kind === 'float' ? 'any' : '1'"
        :placeholder="props.placeholder"
        :value="props.modelValue"
        @input="onInput"
      />

      <input
        v-else
        class="cg-text"
        type="text"
        spellcheck="false"
        :placeholder="props.placeholder"
        :value="props.modelValue"
        @input="onInput"
      />
    </template>
  </label>
</template>

<style scoped>
/* Same input styling as the v2 settings of the config converter. */
.cg-label {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  color: var(--text-secondary, var(--vp-c-text-2));
}

.cg-check-label {
  font-size: 13px;
}

.cg-key {
  font-size: 11px;
  color: var(--vp-c-text-3);
  background: var(--vp-c-bg-alt, var(--vp-c-bg-soft));
  padding: 1px 5px;
  border-radius: 4px;
}

.cg-text {
  box-sizing: border-box;
  width: 100%;
  font-size: 13px;
  padding: 5px 10px;
  border-radius: 6px;
  border: 1px solid var(--border-color, var(--vp-c-divider));
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-family: var(--vp-font-family-mono, monospace);
}

.cg-textarea {
  resize: vertical;
  line-height: 1.5;
}

.cg-text:focus {
  outline: none;
  border-color: var(--vp-c-brand-1);
}

.changed .cg-label,
.changed .cg-check-label {
  color: var(--vp-c-brand-1);
  font-weight: 600;
}

.changed .cg-text {
  border-color: var(--vp-c-brand-1);
}
</style>
