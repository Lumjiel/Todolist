<template>
  <view class="fireworks-container" :style="{ pointerEvents: 'none' }">
    <view 
      v-for="p in particles" 
      :key="p.id"
      class="particle"
      :style="getParticleStyle(p)"
    ></view>
  </view>
</template>

<script setup>
import { ref } from 'vue'

const particles = ref([])
let idCounter = 0

const getParticleStyle = (p) => {
  return {
    left: p.x + 'px',
    top: p.y + 'px',
    backgroundColor: p.color,
    transform: `translate(${p.currentTx}px, ${p.currentTy}px) scale(${p.scale})`,
    opacity: p.opacity,
    transition: p.animating ? `all ${p.duration}ms ease-out` : 'none'
  }
}

const show = (x, y) => {
  const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD']
  const count = 12
  
  const newParticles = []
  
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count
    const velocity = 60 + Math.random() * 40
    const tx = Math.cos(angle) * velocity
    const ty = Math.sin(angle) * velocity
    
    const id = idCounter++
    newParticles.push({
      id,
      x, 
      y,
      tx,
      ty,
      currentTx: 0,
      currentTy: 0,
      scale: 1,
      opacity: 1,
      color: colors[Math.floor(Math.random() * colors.length)],
      duration: 600 + Math.random() * 200,
      animating: false
    })
  }
  
  particles.value.push(...newParticles)
  
  // Start animation in next tick
  setTimeout(() => {
    newParticles.forEach(p => {
      p.animating = true
      p.currentTx = p.tx
      p.currentTy = p.ty
      p.scale = 0
      p.opacity = 0
    })
  }, 50)
  
  // Cleanup
  setTimeout(() => {
    particles.value = particles.value.filter(p => !newParticles.includes(p))
  }, 1000)
}

defineExpose({
  show
})
</script>

<style scoped>
.fireworks-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  overflow: hidden;
}

.particle {
  position: absolute;
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  margin-left: -6rpx;
  margin-top: -6rpx;
}
</style>