<script setup lang="ts">
defineProps<{
  caption: string;
}>();

defineSlots<{
  default(): unknown;
}>();
</script>

<template>
  <ruby :title="caption">
    <slot>注释文本</slot>
    <rp>（</rp>
    <rt>{{ caption }}</rt>
    <rp>）</rp>
  </ruby>
</template>
