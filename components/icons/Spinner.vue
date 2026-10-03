<template>
  <div class="spinner animate-spin" :class="customClass"></div>
</template>

<script>
export default {
  name: 'SpinnerIcon',
  props: {
    customClass: {
      type: String,
      default: 'text-primary-text',
    },
  },
}
</script>
<style scoped>
.spinner {
  border: 4px solid hsl(var(--foreground) / 0.12);
  height: 36px;
  width: 36px;
  border-radius: 50%;
  border-left-color: currentColor;
}
</style>
