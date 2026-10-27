<script setup lang="ts">
import type { SkillLibraryCard } from '~/interfaces/skills'

defineProps<{ skill: SkillLibraryCard }>()
</script>

<template>
  <article class="bt-surface bt-surface-hover relative flex flex-col p-4">
    <div class="flex flex-wrap items-center gap-2">
      <span class="bt-badge bt-badge-primary">
        <Icon v-if="skill.category.slug === 'ai-security'" name="lucide:sparkles" class="size-3" aria-hidden="true" />
        {{ skill.category.name }}
      </span>
      <span class="bt-badge">{{ SKILL_TYPE_LABELS[skill.resource_type] }}</span>
      <span v-if="skill.featured" class="ml-auto inline-flex items-center gap-1 text-xs text-foreground-muted">
        <Icon name="lucide:star" class="size-3.5 text-primary-text" aria-hidden="true" /> Destacada
      </span>
    </div>

    <h3 class="mt-3 text-[17px] font-medium leading-snug text-foreground">
      <!-- El enlace cubre toda la tarjeta (::after) sin anidar enlaces. -->
      <NuxtLink :to="`/skills/${skill.slug}`" class="bt-focus rounded-sm after:absolute after:inset-0 hover:underline">
        {{ skill.title }}
      </NuxtLink>
    </h3>
    <p class="t-small mt-2 line-clamp-3">
      {{ skill.summary }}
    </p>

    <ul v-if="skill.tools.length" class="mt-3 flex flex-wrap gap-1.5" aria-label="Compatibilidad">
      <li v-for="t in skill.tools" :key="t" class="rounded border border-subtle px-1.5 py-0.5 font-mono text-[11px] text-foreground-muted">
        {{ SKILL_TOOL_LABELS[t] }}
      </li>
    </ul>

    <div class="mt-4 flex items-center gap-2.5">
      <span class="flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-full border border-subtle bg-surface-3 text-xs text-foreground-muted">
        <img v-if="skill.author.avatar_url" :src="skill.author.avatar_url" alt="" width="28" height="28" loading="lazy" class="size-full object-cover">
        <template v-else>{{ skill.author.display_name.charAt(0) }}</template>
      </span>
      <span class="t-small truncate">{{ skill.author.display_name }}</span>
    </div>

    <div class="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-subtle pt-3 font-mono text-xs text-foreground-muted mt-4">
      <span v-if="skill.rating.count" class="inline-flex items-center gap-1" :title="`${skill.rating.count} valoraciones`">
        <Icon name="lucide:star" class="size-3.5 text-primary-text" aria-hidden="true" /> {{ skill.rating.average }}
      </span>
      <span class="inline-flex items-center gap-1" title="Descargas"><Icon name="lucide:download" class="size-3.5" aria-hidden="true" /> {{ compactNumber(skill.downloads_count) }}</span>
      <span class="inline-flex items-center gap-1" title="Guardadas"><Icon name="lucide:bookmark" class="size-3.5" aria-hidden="true" /> {{ compactNumber(skill.favorites_count) }}</span>
      <span class="ml-auto">{{ formatSkillDate(skill.published_at) }}</span>
    </div>
  </article>
</template>
