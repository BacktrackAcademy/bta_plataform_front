<script setup lang="ts">
import type { SkillStatus } from '~/interfaces/skills'

defineProps<{ status: SkillStatus }>()
</script>

<template>
  <span class="bt-badge" :class="skillStatusClass(status)">{{ SKILL_STATUS_LABELS[status] }}</span>
</template>
