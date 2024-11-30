import { defineComponent, h } from 'vue'

export const Label = defineComponent({
  name: 'Label',
  props: {
    for: {
      type: String,
      required: false
    },
    class: {
      type: String,
      required: false
    }
  },
  setup(props, { slots }) {
    return () => h('label', {
      for: props.for,
      class: `text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${props.class || ''}`
    }, slots.default?.())
  }
})
