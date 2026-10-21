<script setup>
import { ref, watch, onMounted, onUnmounted, computed } from 'vue'

const props = defineProps({
  value: {
    type: [Number, String],
    default: 0
  },
  duration: {
    type: Number,
    default: 1300 // Duration in milliseconds
  },
  prefix: {
    type: String,
    default: ''
  },
  suffix: {
    type: String,
    default: ''
  },
  decimals: {
    type: Number,
    default: 0
  },
  formatNumber: {
    type: Boolean,
    default: true
  }
})

const displayValue = ref(0)
let animationFrameId = null

// Ease-out cubic easing function for smooth, executive deceleration
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3)

const animateNumber = () => {
  const target = Number(props.value) || 0
  if (isNaN(target)) {
    displayValue.value = 0
    return
  }

  // Cancel any running animation
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
  }

  const startValue = 0
  const startTime = performance.now()

  const step = (currentTime) => {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / props.duration, 1)
    const easedProgress = easeOutCubic(progress)

    const current = startValue + (target - startValue) * easedProgress
    displayValue.value = current

    if (progress < 1) {
      animationFrameId = requestAnimationFrame(step)
    } else {
      displayValue.value = target
    }
  }

  animationFrameId = requestAnimationFrame(step)
}

onMounted(() => {
  animateNumber()
})

onUnmounted(() => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
  }
})

watch(() => props.value, () => {
  animateNumber()
})

const formattedText = computed(() => {
  const val = Number(displayValue.value) || 0
  if (props.decimals > 0) {
    const fixed = val.toFixed(props.decimals)
    if (props.formatNumber) {
      const parts = fixed.split('.')
      parts[0] = Number(parts[0]).toLocaleString('en-US')
      return `${props.prefix}${parts.join('.')}${props.suffix}`
    }
    return `${props.prefix}${fixed}${props.suffix}`
  }

  const rounded = Math.round(val)
  const formatted = props.formatNumber ? rounded.toLocaleString('en-US') : rounded.toString()
  return `${props.prefix}${formatted}${props.suffix}`
})
</script>

<template>
  <span class="inline-block transition-transform duration-150 tabular-nums">
    {{ formattedText }}
  </span>
</template>
