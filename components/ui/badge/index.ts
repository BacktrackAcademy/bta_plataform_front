import { cva, type VariantProps } from 'class-variance-authority'

export { default as Badge } from './Badge.vue'

export const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-sm border px-2 py-0.5 text-xs font-medium transition-colors duration-fast focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/60',
  {
    variants: {
      variant: {
        default: 'border-primary/40 bg-primary/10 text-primary-text',
        secondary: 'border-subtle bg-surface-4 text-foreground-secondary',
        destructive: 'border-danger/30 bg-danger/10 text-danger',
        success: 'border-success/30 bg-success/10 text-success',
        warning: 'border-warning/30 bg-warning/10 text-warning',
        outline: 'border-border text-foreground-secondary',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export type BadgeVariants = VariantProps<typeof badgeVariants>
