<template>
  <div class="hero-carousel">
    <RollingGallery
      v-if="!isLoading || galleryImages.length"
      :autoplay="true"
      :pause-on-hover="true"
      :images="galleryImages"
    />
    <div v-else class="hero-carousel__placeholder">
      正在加载推荐商品...
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import axios from 'axios';
import RollingGallery from '@/components/RollingGallery.vue';

const carouselItems = ref([]);
const isLoading = ref(true);

const galleryImages = computed(() =>
  carouselItems.value
    .map((item) => {
      const url = item?.goods?.image1 || item?.image1;
      if (!url) {
        return null;
      }
      return url.startsWith('http') ? url : `/${url}`;
    })
    .filter(Boolean),
);

onMounted(async () => {
  try {
    const { data } = await axios.get('http://localhost:3000/api/recommend/home');
    carouselItems.value = Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('获取轮播图数据失败:', error);
    carouselItems.value = [];
  } finally {
    isLoading.value = false;
  }
});
</script>

<style scoped>
.hero-carousel {
  position: relative;
  width: 100%;
  margin: 0 auto;
  padding: 24px 0;
}

.hero-carousel__placeholder {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 240px;
  border-radius: 24px;
  background: rgba(39, 3, 166, 0.06);
  color: #5e608c;
  font-weight: 600;
}
</style>
