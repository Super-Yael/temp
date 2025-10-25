<template>
  <div class="home-view">
    <TopNavigation />
    <SearchBar />
    <HeroCarousel />
    <section class="goods-section">
      <h2 class="goods-section__title">全部商品</h2>
      <div class="goods-grid">
        <ContentCard
          v-for="goods in goodsList"
          :key="goods.id"
          :image-src="`/${goods.image1}`"
          :image-alt="goods.name || '商品'"
          :category="goods?.type?.name || '其他分类'"
          :heading="goods.name || '未命名商品'"
          :author-name="formatPrice(goods.price)"
          :author-meta="goods.intro"
          @select-card="() => handleGoodsClick(goods)"
        >
          <template #author>
            <span class="goods-price">{{ formatPrice(goods.price) }}</span>
          </template>
        </ContentCard>
      </div>
    </section>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import axios from 'axios';
import TopNavigation from '@/components/TopNavigation.vue';
import SearchBar from '@/components/SearchBar.vue';
import HeroCarousel from '@/components/HeroCarousel.vue';
import ContentCard from '@/components/ContentCard.vue';

const goodsList = ref([]);

function formatPrice(price) {
  if (price === null || price === undefined) {
    return '价格待定';
  }
  return `¥${Number(price).toFixed(2)}`;
}

function handleGoodsClick(goods) {
  console.log('Selected goods:', goods);
}

onMounted(async () => {
  try {
    const { data } = await axios.get('http://localhost:3000/api/goods');
    goodsList.value = Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Failed to load goods:', error);
    goodsList.value = [];
  }
});
</script>

<style scoped>
.home-view {
  min-height: 100vh;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-bottom: 64px;
}

.goods-section {
  max-width: 1100px;
  margin: 0 auto;
  padding: 32px 16px 64px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.goods-section__title {
  font-size: 24px;
  font-weight: 700;
  color: #2703a6;
  text-align: center;
}

.goods-grid {
  display: grid;
  gap: 24px;
  grid-template-columns: repeat(1, minmax(0, 1fr));
}

@media (min-width: 600px) {
  .goods-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 900px) {
  .goods-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (min-width: 1200px) {
  .goods-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

.goods-price {
  font-weight: 600;
  color: #2703a6;
  font-size: 18px;
  display: inline-block;
  margin-top: 12px;
}
</style>
