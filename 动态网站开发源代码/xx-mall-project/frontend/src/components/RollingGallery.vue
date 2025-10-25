<template>
  <div class="rolling-gallery">
    <div class="rolling-gallery__fade rolling-gallery__fade--left" />
    <div class="rolling-gallery__fade rolling-gallery__fade--right" />

    <div class="rolling-gallery__viewport">
      <Motion
        tag="div"
        class="rolling-gallery__track"
        :style="trackStyle"
        :animate="animateProps"
        :transition="springTransition"
        @mouseenter="handleMouseEnter"
        @mouseleave="handleMouseLeave"
        @mousedown="handleMouseDown"
      >
        <div
          v-for="(url, index) in displayImages"
          :key="`gallery-${index}`"
          :style="getItemStyle(index)"
          class="rolling-gallery__item"
        >
          <img
            :src="url"
            alt="gallery item"
            loading="lazy"
            decoding="async"
            class="rolling-gallery__image"
          />
        </div>
      </Motion>
    </div>
  </div>
</template>

<script setup>
import { Motion } from 'motion-v';
import {
  computed,
  onMounted,
  onUnmounted,
  ref,
  shallowRef,
  watch,
} from 'vue';

/* global defineProps */

const props = defineProps({
  autoplay: {
    type: Boolean,
    default: false,
  },
  pauseOnHover: {
    type: Boolean,
    default: false,
  },
  images: {
    type: Array,
    default: () => [],
  },
});

const DEFAULT_IMAGES = shallowRef([
  'https://images.unsplash.com/photo-1528181304800-259b08848526?q=80&w=3870&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  'https://images.unsplash.com/photo-1506665531195-3566af2b4dfa?q=80&w=3870&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=3456&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  'https://images.unsplash.com/photo-1495103033382-fe343886b671?q=80&w=3870&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  'https://images.unsplash.com/photo-1506781961370-37a89d6b3095?q=80&w=3264&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  'https://images.unsplash.com/photo-1599576838688-8a6c11263108?q=80&w=3870&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  'https://images.unsplash.com/photo-1494094892896-7f14a4433b7a?q=80&w=3870&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  'https://plus.unsplash.com/premium_photo-1664910706524-e783eed89e71?q=80&w=3869&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  'https://images.unsplash.com/photo-1503788311183-fa3bf9c4bc32?q=80&w=3870&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  'https://images.unsplash.com/photo-1585970480901-90d6bb2a48b5?q=80&w=3774&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
]);

const DRAG_FACTOR = 0.15;
const MOMENTUM_FACTOR = 0.05;
const AUTOPLAY_INTERVAL = 2000;
const DRAG_RESTART_DELAY = 1500;
const HOVER_RESTART_DELAY = 100;
const HOVER_DEBOUNCE_DELAY = 50;
const REFERENCE_FACE_COUNT_SPACING = 10;
const REFERENCE_FACE_COUNT_SIZING = 10;

const isScreenSizeSm = ref(false);
const rotateYValue = ref(0);
const autoplayInterval = ref(null);
const autoplayTimeout = ref(null);
const isDragging = ref(false);
const isHovered = ref(false);
const dragStartX = ref(0);
const dragStartRotation = ref(0);

const displayImages = computed(() => {
  const sourceImages = props.images.length > 0 ? props.images : DEFAULT_IMAGES.value;
  const maxImages = REFERENCE_FACE_COUNT_SPACING;

  if (sourceImages.length >= maxImages) {
    return sourceImages;
  }

  const repeatedImages = [];
  const repetitions = Math.ceil(maxImages / sourceImages.length);

  for (let i = 0; i < repetitions; i += 1) {
    repeatedImages.push(...sourceImages);
  }

  return repeatedImages.slice(0, maxImages);
});

const cylinderWidth = computed(() => (isScreenSizeSm.value ? 1100 : 1800));
const faceWidth = computed(() => (cylinderWidth.value / REFERENCE_FACE_COUNT_SIZING) * 1.5);
const radius = computed(() => cylinderWidth.value / (2 * Math.PI));

const trackStyle = computed(() => ({
  width: `${cylinderWidth.value}px`,
  transformStyle: 'preserve-3d',
}));

const animateProps = computed(() => ({
  rotateY: rotateYValue.value,
}));

const springTransition = computed(() => {
  if (isDragging.value) {
    return { duration: 0 };
  }
  return {
    duration: 0.8,
    ease: 'easeOut',
  };
});

const styleCache = new Map();

const getItemStyle = (index) => {
  const cacheKey = `${index}-${faceWidth.value}-${radius.value}`;

  if (styleCache.has(cacheKey)) {
    return styleCache.get(cacheKey);
  }

  const style = {
    width: `${faceWidth.value}px`,
    top: '50%',
    left: '50%',
    transform: `rotateY(${index * (360 / REFERENCE_FACE_COUNT_SPACING)}deg) translateZ(${radius.value}px) translate(-50%, -50%)`,
  };

  if (styleCache.size > 50) {
    styleCache.clear();
  }

  styleCache.set(cacheKey, style);
  return style;
};

let resizeTimeout = null;
let hoverTimeout = null;

const checkScreenSize = () => {
  isScreenSizeSm.value = window.innerWidth <= 640;
};

const throttledResize = () => {
  if (resizeTimeout) return;
  resizeTimeout = window.setTimeout(() => {
    checkScreenSize();
    resizeTimeout = null;
  }, 100);
};

const handleMouseDown = (event) => {
  isDragging.value = true;
  dragStartX.value = event.clientX;
  dragStartRotation.value = rotateYValue.value;

  stopAutoplay();

  document.addEventListener('mousemove', handleMouseMove, { passive: true });
  document.addEventListener('mouseup', handleMouseUp, { passive: true });
  event.preventDefault();
};

const handleMouseMove = (event) => {
  if (!isDragging.value) return;

  const deltaX = event.clientX - dragStartX.value;
  const rotationDelta = deltaX * DRAG_FACTOR;
  rotateYValue.value = dragStartRotation.value + rotationDelta;
};

const handleMouseUp = (event) => {
  if (!isDragging.value) return;

  isDragging.value = false;

  const deltaX = event.clientX - dragStartX.value;
  const velocity = deltaX * MOMENTUM_FACTOR;
  rotateYValue.value += velocity;

  document.removeEventListener('mousemove', handleMouseMove);
  document.removeEventListener('mouseup', handleMouseUp);

  stopAutoplay();

  if (props.autoplay) {
    if (props.pauseOnHover && isHovered.value) {
      return;
    }
    autoplayTimeout.value = window.setTimeout(() => {
      if (!isDragging.value && (!props.pauseOnHover || !isHovered.value)) {
        startAutoplay();
      }
    }, DRAG_RESTART_DELAY);
  }
};

const startAutoplay = () => {
  if (!props.autoplay || isDragging.value || (props.pauseOnHover && isHovered.value)) {
    return;
  }

  stopAutoplay();

  autoplayInterval.value = window.setInterval(() => {
    if (!isDragging.value && (!props.pauseOnHover || !isHovered.value)) {
      rotateYValue.value -= 360 / REFERENCE_FACE_COUNT_SPACING;
    }
  }, AUTOPLAY_INTERVAL);
};

const stopAutoplay = () => {
  if (autoplayInterval.value) {
    window.clearInterval(autoplayInterval.value);
    autoplayInterval.value = null;
  }
  if (autoplayTimeout.value) {
    window.clearTimeout(autoplayTimeout.value);
    autoplayTimeout.value = null;
  }
};

const handleMouseEnter = () => {
  if (hoverTimeout) {
    window.clearTimeout(hoverTimeout);
    hoverTimeout = null;
  }

  hoverTimeout = window.setTimeout(() => {
    isHovered.value = true;

    if (props.autoplay && props.pauseOnHover && !isDragging.value) {
      stopAutoplay();
    }
  }, HOVER_DEBOUNCE_DELAY);
};

const handleMouseLeave = () => {
  if (hoverTimeout) {
    window.clearTimeout(hoverTimeout);
    hoverTimeout = null;
  }

  hoverTimeout = window.setTimeout(() => {
    isHovered.value = false;

    if (props.autoplay && props.pauseOnHover && !isDragging.value) {
      stopAutoplay();
      autoplayTimeout.value = window.setTimeout(() => {
        if (props.autoplay && !isDragging.value && !isHovered.value) {
          startAutoplay();
        }
      }, HOVER_RESTART_DELAY);
    }
  }, HOVER_DEBOUNCE_DELAY);
};

onMounted(() => {
  checkScreenSize();
  window.addEventListener('resize', throttledResize, { passive: true });

  if (props.autoplay) {
    startAutoplay();
  }
});

onUnmounted(() => {
  window.removeEventListener('resize', throttledResize);
  document.removeEventListener('mousemove', handleMouseMove);
  document.removeEventListener('mouseup', handleMouseUp);
  stopAutoplay();
  if (resizeTimeout) {
    window.clearTimeout(resizeTimeout);
  }
  if (hoverTimeout) {
    window.clearTimeout(hoverTimeout);
    hoverTimeout = null;
  }
});

watch(
  () => props.autoplay,
  (newVal) => {
    stopAutoplay();
    if (newVal && !isDragging.value && (!props.pauseOnHover || !isHovered.value)) {
      autoplayTimeout.value = window.setTimeout(() => {
        if (!isDragging.value && (!props.pauseOnHover || !isHovered.value)) {
          startAutoplay();
        }
      }, HOVER_RESTART_DELAY);
    }
  },
);

watch(
  () => props.pauseOnHover,
  () => {
    if (props.autoplay) {
      stopAutoplay();
      if (!isDragging.value && (!props.pauseOnHover || !isHovered.value)) {
        startAutoplay();
      }
    }
  },
);
</script>

<style scoped>
.rolling-gallery {
  position: relative;
  width: 100%;
  height: 400px;
  overflow: hidden;
  background: radial-gradient(circle at center, rgba(39, 3, 166, 0.06), rgba(39, 3, 166, 0));
}

.rolling-gallery__fade {
  position: absolute;
  top: 0;
  width: 64px;
  height: 100%;
  z-index: 2;
  pointer-events: none;
}

.rolling-gallery__fade--left {
  left: 0;
  background: linear-gradient(to left, rgba(11, 11, 11, 0), rgba(11, 11, 11, 0.35));
}

.rolling-gallery__fade--right {
  right: 0;
  background: linear-gradient(to right, rgba(11, 11, 11, 0), rgba(11, 11, 11, 0.35));
}

.rolling-gallery__viewport {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  perspective: 1000px;
  transform-style: preserve-3d;
}

.rolling-gallery__track {
  position: relative;
  display: flex;
  min-height: 220px;
  width: 100%;
  cursor: grab;
  user-select: none;
  transform-style: preserve-3d;
}

.rolling-gallery__track:active {
  cursor: grabbing;
}

.rolling-gallery__item {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 8%;
  backface-visibility: hidden;
  transform-style: preserve-3d;
}

.rolling-gallery__image {
  height: 140px;
  width: 320px;
  border-radius: 18px;
  border: 3px solid rgba(255, 255, 255, 0.9);
  object-fit: cover;
  transition: transform 0.3s ease;
  box-shadow: 0 14px 30px rgba(31, 35, 53, 0.18);
}

.rolling-gallery__image:hover {
  transform: scale(1.05);
}

@media (max-width: 960px) {
  .rolling-gallery {
    height: 360px;
  }

  .rolling-gallery__image {
    width: 260px;
    height: 120px;
  }
}

@media (max-width: 640px) {
  .rolling-gallery {
    height: 320px;
  }

  .rolling-gallery__fade {
    width: 48px;
  }

  .rolling-gallery__image {
    width: 220px;
    height: 110px;
  }
}
</style>
