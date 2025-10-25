<template>
  <div class="home-view">
    <TopNavigation />
    <SearchBar />
    <HeroCarousel />
    <section class="goods-section">
      <h2 class="goods-section__title">全部商品</h2>
      <div
        v-if="feedback.text"
        :class="['goods-feedback', `goods-feedback--${feedback.type}`]"
        role="status"
      >
        {{ feedback.text }}
      </div>
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
          <template #actions>
            <button type="button" class="goods-card__button" @click.stop="handleAddToCart(goods)">
              加入购物车
            </button>
          </template>
        </ContentCard>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import axios from 'axios';
import TopNavigation from '@/components/TopNavigation.vue';
import SearchBar from '@/components/SearchBar.vue';
import HeroCarousel from '@/components/HeroCarousel.vue';
import ContentCard from '@/components/ContentCard.vue';
import { cart } from '@/store/cart';
import { auth } from '@/store/auth';

const goodsList = ref([]);
const cartStore = cart;
const authStore = auth;
const isLoggedIn = computed(() => Boolean(authStore.token.value && authStore.user.value));
const feedback = ref({ type: '', text: '' });
let feedbackTimer = null;

function formatPrice(price) {
  if (price === null || price === undefined) {
    return '价格待定';
  }
  return `¥${Number(price).toFixed(2)}`;
}

function handleGoodsClick(goods) {
  console.log('Selected goods:', goods);
}

const showFeedback = (type, text) => {
  if (feedbackTimer) {
    clearTimeout(feedbackTimer);
  }

  feedback.value = { type, text };
  feedbackTimer = setTimeout(() => {
    feedback.value = { type: '', text: '' };
    feedbackTimer = null;
  }, 2600);
};

const handleAddToCart = async (goods) => {
  if (!isLoggedIn.value) {
    showFeedback('error', '请先登录后再添加到购物车');
    return;
  }

  const result = await cartStore.addToCart(goods.id, 1);
  showFeedback(result.success ? 'success' : 'error', result.message);
};

onMounted(async () => {
  try {
    const { data } = await axios.get('http://localhost:3000/api/goods');
    goodsList.value = Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Failed to load goods:', error);
    goodsList.value = [];
  }
});

onBeforeUnmount(() => {
  if (feedbackTimer) {
    clearTimeout(feedbackTimer);
    feedbackTimer = null;
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

.goods-card__button {
  width: 100%;
  padding: 10px 12px;
  border-radius: 999px;
  border: none;
  background: linear-gradient(135deg, #2703a6, #6c2cf5);
  color: #ffffff;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.16s ease, box-shadow 0.16s ease, opacity 0.16s ease;
}

.goods-card__button:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 20px rgba(39, 3, 166, 0.18);
}

.goods-card__button:active {
  transform: translateY(0);
  opacity: 0.85;
}

.goods-feedback {
  margin-bottom: 16px;
  padding: 12px 16px;
  border-radius: 12px;
  font-weight: 600;
}

.goods-feedback--success {
  background: rgba(60, 180, 75, 0.12);
  color: #2a7a38;
}

.goods-feedback--error {
  background: rgba(217, 48, 37, 0.12);
  color: #b52119;
}
</style>
