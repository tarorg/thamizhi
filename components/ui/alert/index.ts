import { defineComponent, h } from 'vue'

export const Alert = defineComponent({
  name: 'Alert',
  props: {
    variant: {
      type: String,
      default: 'default'
    }
  },
  setup(props, { slots }) {
    return () => h('div', {
      class: `relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground ${
        props.variant === 'destructive'
          ? 'border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive'
          : 'text-foreground'
      }`
    }, slots.default?.())
  }
})

export const AlertTitle = defineComponent({
  name: 'AlertTitle',
  setup(props, { slots }) {
    return () => h('h5', {
      class: 'mb-1 font-medium leading-none tracking-tight'
    }, slots.default?.())
  }
})

export const AlertDescription = defineComponent({
  name: 'AlertDescription',
  setup(props, { slots }) {
    return () => h('div', {
      class: 'text-sm [&_p]:leading-relaxed'
    }, slots.default?.())
  }
})
