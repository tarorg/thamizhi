<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { LockIcon, UnlockIcon, GripVertical } from 'lucide-vue-next'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ImageIcon, TypeIcon, LayoutIcon, DownloadIcon, PlusIcon, XIcon } from 'lucide-vue-next'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'

// Types
interface ImageInteraction {
  type: 'move' | 'resize'
  position?: string
}

// Canvas dimensions
const dimensions = ref({
  width: 1080,
  height: 1080
})

// Poster content
interface PosterContent {
  backgroundImage: File | null
  backgroundUrl: string
  quote: string
  author: string
  fontSize: number
  textColor: string
  textAlign: string
  backgroundColor: string
  backgroundOpacity: number
  theme: string
  heading?: string
  subheading?: string
  fontWeight: string
  fontFamily: string
  letterSpacing: number
  lineHeight: number
  textTransform: string
}

const poster = ref<PosterContent>({
  backgroundImage: null,
  backgroundUrl: '',
  quote: '',
  author: '',
  fontSize: 48,
  textColor: '#ffffff',
  textAlign: 'center',
  backgroundColor: '#ff0000',
  backgroundOpacity: 0,
  theme: 'custom',
  heading: '',
  subheading: '',
  fontWeight: '400',
  fontFamily: 'Arial',
  letterSpacing: 0,
  lineHeight: 1.2,
  textTransform: 'none'
})

// Canvas ref
const canvasRef = ref<HTMLCanvasElement | null>(null)

// Figma-like controls
const isRotating = ref(false)
const rotationStartAngle = ref(0)
const aspectRatioLocked = ref(true)
const originalAspectRatio = ref(1)
const showResizeHandles = ref(false)
const isDragging = ref(false)
const isResizing = ref(false)

// Image transform state
interface ImageTransform {
  x: number
  y: number
  width: number
  height: number
  rotation: number
  scale: number
}

const imageTransform = ref<ImageTransform>({
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  rotation: 0,
  scale: 1
})

// Helper functions
const getAngle = (center: { x: number, y: number }, point: { x: number, y: number }) => {
  return Math.atan2(point.y - center.y, point.x - center.x)
}

const getMousePosition = (e: MouseEvent, canvas: HTMLCanvasElement) => {
  const rect = canvas.getBoundingClientRect()
  return {
    x: (e.clientX - rect.left) * (canvas.width / rect.width),
    y: (e.clientY - rect.top) * (canvas.height / rect.height)
  }
}

// Mouse event handlers
const handleDoubleClick = (e: MouseEvent) => {
  const canvas = canvasRef.value
  if (!canvas || !poster.value.backgroundUrl) return
  
  const interaction = getImageHandleAtPosition(e, canvas)
  if (interaction?.type === 'move') {
    showResizeHandles.value = !showResizeHandles.value
    renderPoster()
  }
}

const handleMouseDown = (e: MouseEvent) => {
  const canvas = canvasRef.value
  if (!canvas) return

  const pos = getMousePosition(e, canvas)
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // Check for text elements
  for (const element of textElements.value) {
    // Check if clicking grip handle
    if (element.gripHitbox) {
      const grip = element.gripHitbox
      if (
        pos.x >= grip.x && 
        pos.x <= grip.x + grip.width && 
        pos.y >= grip.y && 
        pos.y <= grip.height
      ) {
        toggleTextControls(element.id)
        return
      }
    }

    const text = element.type === 'heading' ? poster.value.heading : poster.value.subheading
    if (!text) continue

    ctx.font = element.type === 'heading' 
      ? `${poster.value.fontWeight} ${poster.value.fontSize}px ${poster.value.fontFamily}`
      : `${poster.value.fontWeight} ${poster.value.fontSize * 0.6}px ${poster.value.fontFamily}`
    
    const metrics = ctx.measureText(text)
    const height = element.type === 'heading' ? poster.value.fontSize : poster.value.fontSize * 0.6
    const padding = 10
    const handleSize = 16

    // Check if clicking drag handle
    const handleX = element.x + metrics.width/2 + padding + 5
    const handleY = element.y - height/2
    
    if (Math.sqrt(Math.pow(pos.x - handleX, 2) + Math.pow(pos.y - handleY, 2)) <= handleSize/2) {
      toggleTextControls(element.id)
      return
    }

    // Check if clicking text area
    const hitBox = {
      x: element.x - metrics.width/2 - padding,
      y: element.y - height - padding,
      width: metrics.width + padding * 2,
      height: height + padding * 2
    }

    if (pos.x >= hitBox.x && 
        pos.x <= hitBox.x + hitBox.width && 
        pos.y >= hitBox.y && 
        pos.y <= hitBox.y + hitBox.height) {
      handleTextDragStart(e, element.id)
      return
    }
  }

  // Handle image interactions
  if (poster.value.backgroundUrl) {
    const interaction = getImageHandleAtPosition(e, canvas)
    if (!interaction) return
    
    if (interaction.type === 'resize' && interaction.position) {
      handleCornerDrag(e, interaction.position)
    } else if (interaction.type === 'move') {
      handleImageDrag(e)
      showResizeHandles.value = false
    }
    
    isDragging.value = true
    renderPoster()
  }
}

const handleCornerDrag = (e: MouseEvent, corner: string) => {
  e.preventDefault()
  const canvas = canvasRef.value
  if (!canvas) return

  const startPos = getMousePosition(e, canvas)
  const startTransform = { ...imageTransform.value }
  const center = {
    x: canvas.width/2 + startTransform.x,
    y: canvas.height/2 + startTransform.y
  }

  const onMouseMove = (moveEvent: MouseEvent) => {
    const currentPos = getMousePosition(moveEvent, canvas)
    const dx = currentPos.x - startPos.x
    const dy = currentPos.y - startPos.y

    // Handle rotation if Alt key is pressed
    if (moveEvent.altKey) {
      const startAngle = getAngle(center, startPos)
      const currentAngle = getAngle(center, currentPos)
      const rotation = currentAngle - startAngle
      
      imageTransform.value = {
        ...imageTransform.value,
        rotation: startTransform.rotation + rotation
      }
      renderPoster()
      return
    }

    // Calculate new dimensions based on corner being dragged
    let newWidth = startTransform.width
    let newHeight = startTransform.height
    let newX = startTransform.x
    let newY = startTransform.y

    if (corner.includes('right')) {
      newWidth = startTransform.width + dx
    } else if (corner.includes('left')) {
      newWidth = startTransform.width - dx
      newX = startTransform.x + dx
    }

    if (corner.includes('bottom')) {
      newHeight = startTransform.height + dy
    } else if (corner.includes('top')) {
      newHeight = startTransform.height - dy
      newY = startTransform.y + dy
    }

    // Maintain aspect ratio if shift is pressed or locked
    if (moveEvent.shiftKey || aspectRatioLocked.value) {
      const ratio = originalAspectRatio.value
      if (Math.abs(dx) > Math.abs(dy)) {
        newHeight = newWidth / ratio
      } else {
        newWidth = newHeight * ratio
      }
    }

    // Maintain minimum size
    const minSize = 20
    if (newWidth >= minSize && newHeight >= minSize) {
      imageTransform.value = {
        ...imageTransform.value,
        width: newWidth,
        height: newHeight,
        x: newX,
        y: newY
      }
      renderPoster()
    }
  }

  const onMouseUp = () => {
    isResizing.value = false
    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseup', onMouseUp)
  }

  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', onMouseUp)
}

const handleImageDrag = (e: MouseEvent) => {
  const canvas = canvasRef.value
  if (!canvas) return
  
  const startPos = getMousePosition(e, canvas)
  const startTransform = { ...imageTransform.value }
  
  const onMouseMove = (moveEvent: MouseEvent) => {
    const currentPos = getMousePosition(moveEvent, canvas)
    imageTransform.value = {
      ...imageTransform.value,
      x: startTransform.x + (currentPos.x - startPos.x),
      y: startTransform.y + (currentPos.y - startPos.y)
    }
    renderPoster()
  }
  
  const onMouseUp = () => {
    isDragging.value = false
    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseup', onMouseUp)
  }
  
  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', onMouseUp)
}

const getImageHandleAtPosition = (e: MouseEvent, canvas: HTMLCanvasElement): ImageInteraction | null => {
  const rect = canvas.getBoundingClientRect()
  const x = (e.clientX - rect.left) * (canvas.width / rect.width)
  const y = (e.clientY - rect.top) * (canvas.height / rect.height)
  
  const centerX = canvas.width/2 + imageTransform.value.x
  const centerY = canvas.height/2 + imageTransform.value.y
  const scaledWidth = imageTransform.value.width * imageTransform.value.scale
  const scaledHeight = imageTransform.value.height * imageTransform.value.scale
  
  const imgX = centerX - scaledWidth/2
  const imgY = centerY - scaledHeight/2
  const imgRight = imgX + scaledWidth
  const imgBottom = imgY + scaledHeight
  
  const handleSize = 8
  
  // Check corners
  const corners = [
    { pos: 'top-left', x: imgX, y: imgY },
    { pos: 'top-right', x: imgRight, y: imgY },
    { pos: 'bottom-left', x: imgX, y: imgBottom },
    { pos: 'bottom-right', x: imgRight, y: imgBottom }
  ]
  
  for (const corner of corners) {
    if (Math.abs(x - corner.x) <= handleSize && Math.abs(y - corner.y) <= handleSize) {
      return { type: 'resize', position: corner.pos }
    }
  }
  
  // Check if clicking on image
  if (x >= imgX && x <= imgRight && y >= imgY && y <= imgBottom) {
    return { type: 'move' }
  }
  
  return null
}

// Update the drawAsterisk function to create a Y-shaped asterisk
const drawAsterisk = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, thickness: number) => {
  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = thickness
  ctx.lineCap = 'round' // Add rounded ends for cleaner look
  
  // Draw the vertical line (stem)
  ctx.beginPath()
  ctx.moveTo(x, y)
  ctx.lineTo(x, y + size)
  ctx.stroke()
  
  // Draw the two diagonal lines at the top
  const angle = Math.PI / 4 // 45 degrees
  const topY = y // Top point
  
  // Right diagonal
  ctx.beginPath()
  ctx.moveTo(x, topY)
  ctx.lineTo(x + size * Math.cos(-angle), topY - size * Math.sin(-angle))
  ctx.stroke()
  
  // Left diagonal
  ctx.beginPath()
  ctx.moveTo(x, topY)
  ctx.lineTo(x + size * Math.cos(-Math.PI + angle), topY - size * Math.sin(-Math.PI + angle))
  ctx.stroke()

  // Draw resize handle if being dragged
  if (asterisk.value.isDragging) {
    ctx.strokeStyle = '#4F46E5'
    ctx.fillStyle = 'white'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(x + size, y + size, 6, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()
  }
}

// Add this function to check if a point is within the asterisk area
const isPointInAsterisk = (x: number, y: number, asteriskX: number, asteriskY: number, size: number): string | null => {
  const distance = Math.sqrt(Math.pow(x - asteriskX, 2) + Math.pow(y - asteriskY, 2))
  
  // Check if clicking resize handle
  const handleX = asteriskX + size
  const handleY = asteriskY + size
  const handleDistance = Math.sqrt(Math.pow(x - handleX, 2) + Math.pow(y - handleY, 2))
  
  if (handleDistance <= 6) {
    return 'resize'
  }
  
  // Check if clicking asterisk
  if (distance <= size) {
    return 'move'
  }
  
  return null
}

// Render function
const renderPoster = async () => {
  const canvas = canvasRef.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // Set canvas dimensions
  canvas.width = dimensions.value.width
  canvas.height = dimensions.value.height

  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  // Draw background color
  ctx.fillStyle = poster.value.backgroundColor
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Draw Asterisk in top-right corner
  ctx.save()
  const asteriskSize = 40 // Adjust size as needed
  const padding = 20 // Distance from edges
  
  // Position in top-right corner
  ctx.translate(canvas.width - asteriskSize - padding, padding)
  
  // Set the color
  ctx.fillStyle = poster.value.asteriskColor
  
  // Draw the asterisk path
  ctx.beginPath()
  const path = new Path2D("M489.838,29.354v443.603L68.032,335.894L0,545.285l421.829,137.086l-260.743,358.876l178.219,129.398L600.048,811.84l260.673,358.806l178.146-129.398L778.101,682.465L1200,545.379l-68.032-209.403l-421.899,137.07V29.443H489.84L489.838,29.354z")
  
  // Scale the path to our desired size
  ctx.scale(asteriskSize/1200, asteriskSize/1200)
  ctx.fill(path)
  ctx.restore()

  // Draw background image if exists
  if (poster.value.backgroundUrl) {
    try {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      
      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
        img.src = poster.value.backgroundUrl
      })

      // Calculate image position with scale and rotation
      const scaledWidth = imageTransform.value.width * imageTransform.value.scale
      const scaledHeight = imageTransform.value.height * imageTransform.value.scale
      const centerX = canvas.width/2 + imageTransform.value.x
      const centerY = canvas.height/2 + imageTransform.value.y
      
      // Draw image with rotation
      ctx.save()
      ctx.globalAlpha = 1 - poster.value.backgroundOpacity
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      
      // Apply transformations
      ctx.translate(centerX, centerY)
      ctx.rotate(imageTransform.value.rotation)
      ctx.translate(-centerX, -centerY)
      
      // Draw the image
      ctx.drawImage(
        img,
        Math.round(centerX - scaledWidth/2),
        Math.round(centerY - scaledHeight/2),
        Math.round(scaledWidth),
        Math.round(scaledHeight)
      )

      // Only draw handles when actively interacting
      if (isDragging.value || isResizing.value) {
        // Draw handles and borders
        ctx.strokeStyle = '#4F46E5'
        ctx.lineWidth = 2
        ctx.strokeRect(
          centerX - scaledWidth/2,
          centerY - scaledHeight/2,
          scaledWidth,
          scaledHeight
        )
        
        // Draw corner handles
        const handleSize = 8
        const corners = [
          { x: -scaledWidth/2, y: -scaledHeight/2 },
          { x: scaledWidth/2, y: -scaledHeight/2 },
          { x: -scaledWidth/2, y: scaledHeight/2 },
          { x: scaledWidth/2, y: scaledHeight/2 }
        ]
        
        corners.forEach(corner => {
          ctx.fillStyle = 'white'
          ctx.strokeStyle = '#4F46E5'
          ctx.beginPath()
          ctx.arc(centerX + corner.x, centerY + corner.y, handleSize/2, 0, Math.PI * 2)
          ctx.fill()
          ctx.stroke()
        })
      }
      
      ctx.restore()
    } catch (err) {
      console.error('Error drawing background image:', err)
    }
  }

  // Draw the asterisk with current properties
  drawAsterisk(
    ctx,
    asterisk.value.x,
    asterisk.value.y,
    asterisk.value.size,
    asterisk.value.thickness
  )

  // Draw text elements with controls
  for (const element of textElements.value) {
    const text = element.type === 'heading' ? poster.value.heading : poster.value.subheading
    if (!text) continue

    ctx.font = element.type === 'heading' 
      ? `${poster.value.fontWeight} ${poster.value.fontSize}px ${poster.value.fontFamily}`
      : `${poster.value.fontWeight} ${poster.value.fontSize * 0.6}px ${poster.value.fontFamily}`
    
    ctx.textAlign = poster.value.textAlign as CanvasTextAlign
    const metrics = ctx.measureText(text)
    const height = element.type === 'heading' ? poster.value.fontSize : poster.value.fontSize * 0.6
    
    // Draw controls if element is being dragged or controls are shown
    if (element.isDragging || element.showControls) {
      const padding = 10
      
      // Draw background
      ctx.fillStyle = 'rgba(79, 70, 229, 0.1)' // Indigo with opacity
      ctx.fillRect(
        element.x - metrics.width/2 - padding,
        element.y - height - padding,
        metrics.width + padding * 2,
        height + padding * 2
      )

      // Draw border
      ctx.strokeStyle = '#4F46E5'
      ctx.lineWidth = 1
      ctx.strokeRect(
        element.x - metrics.width/2 - padding,
        element.y - height - padding,
        metrics.width + padding * 2,
        height + padding * 2
      )

      // Draw drag handle icon (grip)
      const gripX = element.x + metrics.width/2 + padding + 5
      const gripY = element.y - height/2
      const gripWidth = 16
      const gripHeight = 16
      
      // Draw grip background
      ctx.fillStyle = '#4F46E5'
      ctx.beginPath()
      ctx.arc(gripX, gripY, gripWidth/2, 0, Math.PI * 2)
      ctx.fill()
      
      // Draw grip lines
      ctx.strokeStyle = 'white'
      ctx.lineWidth = 2
      
      // Draw three horizontal lines
      const lineWidth = 8
      const spacing = 3
      for (let i = -1; i <= 1; i++) {
        const y = gripY + i * spacing
        ctx.beginPath()
        ctx.moveTo(gripX - lineWidth/2, y)
        ctx.lineTo(gripX + lineWidth/2, y)
        ctx.stroke()
      }

      // Add hover effect area for grip
      const gripHitbox = {
        x: gripX - gripWidth/2,
        y: gripY - gripHeight/2,
        width: gripWidth,
        height: gripHeight
      }

      // Store grip hitbox for interaction
      element.gripHitbox = gripHitbox
    }

    // Draw text
    ctx.fillStyle = poster.value.textColor
    ctx.fillText(text, element.x, element.y)
  }
}

// Watch for changes
watch([dimensions, poster], () => {
  renderPoster()
}, { deep: true })

// Lifecycle hooks
onMounted(() => {
  renderPoster()
  
  // Add keyboard event listeners
  window.addEventListener('keydown', (e) => {
    if (e.key === 'r') {
      imageTransform.value.rotation = 0
      renderPoster()
    }
    if (e.key === 'Shift') {
      aspectRatioLocked.value = true
    }
  })

  window.addEventListener('keyup', (e) => {
    if (e.key === 'Shift') {
      aspectRatioLocked.value = false
    }
  })
})

onBeforeUnmount(() => {
  if (poster.value.backgroundUrl) {
    URL.revokeObjectURL(poster.value.backgroundUrl)
  }
})

// Add these to your script section
const isUploading = ref(false)

// Common social media sizes
const presetSizes = [
  { width: 1080, height: 1080, name: 'Instagram Square' },
  { width: 1080, height: 1350, name: 'Instagram Portrait' },
  { width: 1200, height: 630, name: 'Facebook/Twitter' },
  { width: 1920, height: 1080, name: 'Full HD' }
]

// Handle background image upload
const handleImageUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement
  if (!input.files?.length) return
  
  const file = input.files[0]
  isUploading.value = true
  
  try {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.crossOrigin = 'anonymous'
    
    await new Promise((resolve, reject) => {
      img.onload = () => {
        // Calculate initial size to fit the canvas while maintaining aspect ratio
        const canvasAspect = dimensions.value.width / dimensions.value.height
        const imageAspect = img.width / img.height
        
        let width, height
        
        if (imageAspect > canvasAspect) {
          width = dimensions.value.width
          height = width / imageAspect
        } else {
          height = dimensions.value.height
          width = height * imageAspect
        }

        // Center the image
        originalAspectRatio.value = imageAspect
        imageTransform.value = {
          x: 0,
          y: 0,
          width,
          height,
          rotation: 0,
          scale: 1
        }
        resolve(true)
      }
      img.onerror = reject
      img.src = url
    })
    
    if (poster.value.backgroundUrl) {
      URL.revokeObjectURL(poster.value.backgroundUrl)
    }
    poster.value.backgroundUrl = url
    poster.value.backgroundImage = file
    
    await renderPoster()
    
  } catch (err) {
    console.error('Image handling error:', err)
    if (poster.value.backgroundUrl) {
      URL.revokeObjectURL(poster.value.backgroundUrl)
    }
    poster.value.backgroundImage = null
    poster.value.backgroundUrl = ''
  } finally {
    isUploading.value = false
  }
}

// Remove background image
const removeBackgroundImage = () => {
  if (poster.value.backgroundUrl) {
    URL.revokeObjectURL(poster.value.backgroundUrl)
  }
  poster.value.backgroundUrl = ''
  poster.value.backgroundImage = null
  renderPoster()
}

// Apply preset size
const applyPresetSize = (preset: { width: number, height: number }) => {
  dimensions.value = { ...preset }
  renderPoster()
}

// Download poster
const downloadPoster = () => {
  const canvas = canvasRef.value
  if (!canvas) return

  const link = document.createElement('a')
  link.download = 'poster.png'
  link.href = canvas.toDataURL('image/png')
  link.click()
}

// Add to your interfaces
interface TextElement {
  id: string
  type: 'heading' | 'subheading'
  x: number
  y: number
  isDragging: boolean
  showControls: boolean
  gripHitbox?: {
    x: number
    y: number
    width: number
    height: number
  }
}

// Add to your refs
const textElements = ref<TextElement[]>([
  {
    id: 'heading',
    type: 'heading',
    x: dimensions.value.width / 2,
    y: dimensions.value.height * 0.15,
    isDragging: false,
    showControls: false
  },
  {
    id: 'subheading',
    type: 'subheading',
    x: dimensions.value.width / 2,
    y: dimensions.value.height * 0.25,
    isDragging: false,
    showControls: false
  }
])

// Add text dragging handlers
const handleTextDragStart = (e: MouseEvent, elementId: string) => {
  const canvas = canvasRef.value
  if (!canvas) return

  const element = textElements.value.find(el => el.id === elementId)
  if (!element) return

  element.isDragging = true
  const startPos = getMousePosition(e, canvas)
  const startX = element.x
  const startY = element.y

  const onMouseMove = (moveEvent: MouseEvent) => {
    const currentPos = getMousePosition(moveEvent, canvas)
    const dx = currentPos.x - startPos.x
    const dy = currentPos.y - startPos.y
    
    // Update element position
    element.x = startX + dx
    element.y = startY + dy
    
    // Keep text within canvas bounds
    element.x = Math.max(0, Math.min(canvas.width, element.x))
    element.y = Math.max(poster.value.fontSize, Math.min(canvas.height, element.y))
    
    renderPoster()
  }

  const onMouseUp = () => {
    element.isDragging = false
    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseup', onMouseUp)
  }

  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', onMouseUp)
}

// Add text element position reset
const resetTextPositions = () => {
  textElements.value = textElements.value.map(el => ({
    ...el,
    x: dimensions.value.width / 2,
    y: el.type === 'heading' ? dimensions.value.height * 0.15 : dimensions.value.height * 0.25
  }))
  renderPoster()
}

// Add function to toggle controls
const toggleTextControls = (elementId: string) => {
  textElements.value = textElements.value.map(el => ({
    ...el,
    showControls: el.id === elementId ? !el.showControls : false
  }))
  renderPoster()
}

// Add cursor style change on hover
const handleMouseMove = (e: MouseEvent) => {
  const canvas = canvasRef.value
  if (!canvas) return

  const pos = getMousePosition(e, canvas)
  let isOverGrip = false

  for (const element of textElements.value) {
    if (element.gripHitbox) {
      const grip = element.gripHitbox
      if (
        pos.x >= grip.x && 
        pos.x <= grip.x + grip.width && 
        pos.y >= grip.y && 
        pos.y <= grip.height
      ) {
        isOverGrip = true
        break
      }
    }
  }

  canvas.style.cursor = isOverGrip ? 'pointer' : 'default'
}
</script>

<template>
  <div class="h-screen flex">
    <!-- Left Sidebar - Settings -->
    <div class="w-[300px] border-r bg-background flex flex-col h-full">
      <Tabs defaultValue="content" class="w-full h-full">
        <TabsList class="flex w-full justify-start border-b px-2 py-1 gap-1">
          <TabsTrigger 
            v-for="tab in ['content', 'background', 'size']" 
            :key="tab"
            :value="tab"
            class="data-[state=active]:bg-muted px-3 py-2 rounded-md"
          >
            <component 
              :is="tab === 'content' ? TypeIcon : tab === 'background' ? ImageIcon : LayoutIcon" 
              class="w-4 h-4"
            />
          </TabsTrigger>
        </TabsList>

        <div class="p-4 overflow-y-auto flex-1">
          <!-- Content Tab -->
          <TabsContent value="content" class="mt-0 space-y-4">
            <div class="space-y-2">
              <label class="text-sm font-medium">Heading</label>
              <Input
                v-model="poster.heading"
                placeholder="Main heading..."
              />
            </div>

            <div class="space-y-2">
              <label class="text-sm font-medium">Subheading</label>
              <Input
                v-model="poster.subheading"
                placeholder="Subheading..."
              />
            </div>

            <div class="space-y-2">
              <label class="text-sm font-medium">Font Size</label>
              <Input
                v-model="poster.fontSize"
                type="number"
                min="12"
                max="120"
              />
            </div>

            <div class="space-y-2">
              <label class="text-sm font-medium">Text Color</label>
              <Input
                v-model="poster.textColor"
                type="color"
              />
            </div>

            <div class="space-y-2">
              <label class="text-sm font-medium">Text Alignment</label>
              <select
                v-model="poster.textAlign"
                class="w-full p-2 rounded-md border bg-background"
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </div>

            <div class="space-y-2">
              <label class="text-sm font-medium">Font</label>
              <select
                v-model="poster.fontFamily"
                class="w-full p-2 rounded-md border bg-background"
              >
                <option value="Inter">Inter</option>
                <option value="Arial">Arial</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Georgia">Georgia</option>
                <option value="Courier New">Courier New</option>
              </select>
            </div>

            <div class="space-y-2">
              <label class="text-sm font-medium">Font Weight</label>
              <select
                v-model="poster.fontWeight"
                class="w-full p-2 rounded-md border bg-background"
              >
                <option value="100">Thin</option>
                <option value="300">Light</option>
                <option value="400">Regular</option>
                <option value="500">Medium</option>
                <option value="600">Semibold</option>
                <option value="700">Bold</option>
                <option value="800">Black</option>
              </select>
            </div>

            <div class="space-y-2">
              <label class="text-sm font-medium">Text Transform</label>
              <select
                v-model="poster.textTransform"
                class="w-full p-2 rounded-md border bg-background"
              >
                <option value="none">None</option>
                <option value="uppercase">Uppercase</option>
                <option value="lowercase">Lowercase</option>
              </select>
            </div>

            <div class="space-y-2">
              <label class="text-sm font-medium">Letter Spacing</label>
              <Input
                v-model="poster.letterSpacing"
                type="number"
                min="-20"
                max="100"
                step="1"
              />
            </div>

            <div class="space-y-2">
              <label class="text-sm font-medium">Line Height</label>
              <Input
                v-model="poster.lineHeight"
                type="number"
                min="0.5"
                max="3"
                step="0.1"
              />
            </div>

            <div class="space-y-2">
              <Button 
                variant="outline" 
                size="sm"
                class="w-full"
                @click="resetTextPositions"
              >
                Reset Text Positions
              </Button>
            </div>
          </TabsContent>

          <!-- Background Tab -->
          <TabsContent value="background" class="mt-0 space-y-4">
            <div class="space-y-2">
              <label class="text-sm font-medium">Background Image</label>
              <div class="flex items-center gap-2">
                <!-- Image Preview -->
                <div 
                  v-if="poster.backgroundUrl" 
                  class="relative h-[50px] w-[50px] border rounded-lg overflow-hidden group"
                >
                  <img 
                    :src="poster.backgroundUrl" 
                    class="w-full h-full object-cover"
                    alt="Background preview"
                  />
                  <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button 
                      variant="secondary" 
                      size="icon"
                      class="h-6 w-6"
                      @click="removeBackgroundImage"
                    >
                      <XIcon class="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <!-- Upload Button -->
                <label class="relative">
                  <Button 
                    variant="outline" 
                    size="sm"
                    class="flex items-center gap-2"
                    :class="{ 'opacity-50 pointer-events-none': isUploading }"
                  >
                    <PlusIcon class="w-4 h-4" />
                    {{ poster.backgroundUrl ? 'Change' : 'Add Image' }}
                  </Button>
                  <input
                    type="file"
                    accept="image/*"
                    class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    @change="handleImageUpload"
                  />
                </label>
              </div>
            </div>

            <div class="space-y-2">
              <label class="text-sm font-medium">Background Color</label>
              <Input
                v-model="poster.backgroundColor"
                type="color"
              />
            </div>

            <div class="space-y-2">
              <label class="text-sm font-medium">Background Opacity</label>
              <Input
                v-model="poster.backgroundOpacity"
                type="range"
                min="0"
                max="1"
                step="0.1"
              />
            </div>
          </TabsContent>

          <!-- Size Tab -->
          <TabsContent value="size" class="mt-0 space-y-4">
            <div class="space-y-2">
              <label class="text-sm font-medium">Preset Sizes</label>
              <div class="grid gap-2">
                <Button
                  v-for="preset in presetSizes"
                  :key="`${preset.width}x${preset.height}`"
                  variant="outline"
                  class="justify-start"
                  @click="applyPresetSize(preset)"
                >
                  {{ preset.width }}x{{ preset.height }} - {{ preset.name }}
                </Button>
              </div>
            </div>

            <div class="space-y-2">
              <label class="text-sm font-medium">Custom Size</label>
              <div class="grid grid-cols-2 gap-2">
                <div class="space-y-1">
                  <label class="text-xs">Width</label>
                  <Input
                    v-model="dimensions.width"
                    type="number"
                    min="100"
                  />
                </div>
                <div class="space-y-1">
                  <label class="text-xs">Height</label>
                  <Input
                    v-model="dimensions.height"
                    type="number"
                    min="100"
                  />
                </div>
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>

    <!-- Main Canvas Area -->
    <div class="flex-1 bg-muted/10 flex flex-col h-full">
      <!-- Toolbar -->
      <div class="h-12 border-b bg-background flex items-center justify-between px-4">
        <div class="flex items-center gap-2">
          <h1 class="text-lg font-medium">Poster</h1>
        </div>
        <Button variant="default" @click="downloadPoster">
          <DownloadIcon class="w-4 h-4 mr-2" />
          Download
        </Button>
      </div>

      <!-- Canvas Container -->
      <div class="flex-1 p-4 flex items-center justify-center">
        <div 
          class="relative bg-background rounded-lg shadow-lg p-4 select-none"
          style="width: fit-content;"
        >
          <div 
            class="relative"
            :style="{
              width: `${Math.min(400, dimensions.width)}px`,
              height: `${Math.min(400 * (dimensions.height / dimensions.width), 400)}px`
            }"
          >
            <canvas 
              ref="canvasRef"
              class="w-full h-full object-contain rounded-lg"
              @mousedown="handleMouseDown"
              @mousemove="handleMouseMove"
              @dblclick="handleDoubleClick"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
canvas {
  @apply rounded-lg;
}

input[type="range"] {
  @apply w-full;
}

input[type="color"] {
  @apply w-full h-10 p-1;
}

:deep(.tabs-trigger) {
  @apply hover:bg-muted/80 transition-colors;
}

:deep(.tabs-content) {
  @apply mt-0;
}
</style>