<script setup lang="ts">
// Decorative brand panel for auth screens. Purely visual (aria-hidden) and static.
const nodes = [
  { x: 90, y: 130, r: 3, d: 0 },
  { x: 230, y: 70, r: 2, d: 1.2 },
  { x: 340, y: 190, r: 4, d: 2.4 },
  { x: 180, y: 300, r: 2, d: 0.6 },
  { x: 440, y: 120, r: 2, d: 3 },
  { x: 520, y: 260, r: 3, d: 1.8 },
  { x: 400, y: 380, r: 2, d: 3.6 },
  { x: 120, y: 450, r: 3, d: 2.1 },
  { x: 300, y: 500, r: 2, d: 0.3 },
  { x: 560, y: 470, r: 3, d: 2.7 },
]
const links = [[0, 1], [1, 2], [2, 3], [1, 4], [4, 5], [2, 5], [5, 6], [3, 7], [3, 6], [6, 8], [7, 8], [6, 9], [5, 9]]
</script>

<template>
  <div class="auth-backdrop absolute inset-0 overflow-hidden" aria-hidden="true">
    <div class="absolute inset-0 bg-gradient-to-br from-surface-2 via-background to-background" />
    <div class="auth-glow absolute -left-40 top-1/3 size-[640px] rounded-full" />
    <div class="auth-grid absolute inset-0" />

    <svg class="absolute inset-0 size-full opacity-60" viewBox="0 0 640 560" preserveAspectRatio="xMidYMid slice" fill="none">
      <line
        v-for="(l, i) in links"
        :key="i"
        :x1="nodes[l[0]].x" :y1="nodes[l[0]].y" :x2="nodes[l[1]].x" :y2="nodes[l[1]].y"
        stroke="hsl(var(--foreground) / 0.07)" stroke-width="1"
      />
      <circle
        v-for="(n, i) in nodes"
        :key="i"
        :cx="n.x" :cy="n.y" :r="n.r"
                :fill="i === 2 ? 'hsl(var(--primary))' : 'hsl(var(--foreground) / 0.5)'"
      />
    </svg>

    <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,#0E0F22_100%)]" />
  </div>
</template>

<style scoped>
.auth-grid {
  background-image:
    linear-gradient(hsl(var(--foreground) / 0.035) 1px, transparent 1px),
    linear-gradient(90deg, hsl(var(--foreground) / 0.035) 1px, transparent 1px);
  background-size: 56px 56px;
  mask-image: radial-gradient(ellipse at 40% 50%, #000 20%, transparent 75%);
}
.auth-glow {
  background: radial-gradient(circle, hsl(var(--primary) / 0.12), transparent 65%);
  filter: blur(40px);
}
</style>
