<script setup lang="ts">
// Decorative brand panel for auth screens. Purely visual (aria-hidden) and static when reduced motion is requested.
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
    <div class="absolute inset-0 bg-gradient-to-br from-[#141228] via-[#0E0F22] to-[#0E0F22]" />
    <div class="auth-glow absolute -left-40 top-1/3 size-[640px] rounded-full" />
    <div class="auth-grid absolute inset-0" />

    <svg class="absolute inset-0 size-full opacity-60" viewBox="0 0 640 560" preserveAspectRatio="xMidYMid slice" fill="none">
      <line
        v-for="(l, i) in links"
        :key="i"
        :x1="nodes[l[0]].x" :y1="nodes[l[0]].y" :x2="nodes[l[1]].x" :y2="nodes[l[1]].y"
        stroke="rgba(255,255,255,0.07)" stroke-width="1"
      />
      <circle
        v-for="(n, i) in nodes"
        :key="i"
        class="auth-node"
        :cx="n.x" :cy="n.y" :r="n.r"
        :style="{ animationDelay: `${n.d}s` }"
        :fill="i === 2 ? '#EC1075' : 'rgba(255,255,255,0.5)'"
      />
    </svg>

    <div class="auth-scan absolute inset-y-0 w-px" />
    <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,#0E0F22_100%)]" />
  </div>
</template>

<style scoped>
.auth-grid {
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.035) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.035) 1px, transparent 1px);
  background-size: 56px 56px;
  mask-image: radial-gradient(ellipse at 40% 50%, #000 20%, transparent 75%);
  animation: grid-drift 90s linear infinite;
}
.auth-glow {
  background: radial-gradient(circle, rgba(236, 16, 117, 0.16), transparent 65%);
  filter: blur(40px);
  animation: glow-drift 18s ease-in-out infinite alternate;
}
.auth-scan {
  left: 0;
  background: linear-gradient(to bottom, transparent, rgba(236, 16, 117, 0.35), transparent);
  animation: scan 16s linear infinite;
}
.auth-node {
  animation: node-pulse 5s ease-in-out infinite;
}
@keyframes grid-drift { to { background-position: 56px 56px; } }
@keyframes glow-drift { to { transform: translate(60px, -40px); } }
@keyframes scan { from { transform: translateX(0); opacity: 0; } 10%, 90% { opacity: 1; } to { transform: translateX(100vw); opacity: 0; } }
@keyframes node-pulse { 0%, 100% { opacity: 0.25; } 50% { opacity: 1; } }

@media (prefers-reduced-motion: reduce) {
  .auth-grid, .auth-glow, .auth-node { animation: none; }
  .auth-scan { display: none; }
}
</style>
