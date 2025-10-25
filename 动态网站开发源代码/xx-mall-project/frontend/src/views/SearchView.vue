<template>
  <section class="search-view">
    <header class="search-view__header">
      <h2>搜索结果</h2>
      <p v-if="keyword">关键词："{{ keyword }}"</p>
    </header>

    <div v-if="loading" class="search-view__status">正在加载...</div>
    <div v-else-if="error" class="search-view__status search-view__status--error">{{ error }}</div>
    <div v-else-if="results.length === 0" class="search-view__status">暂无匹配的商品</div>

    <ul v-else class="search-view__grid">
      <li v-for="item in results" :key="item.id" class="search-view__card">
        <RouterLink :to="`/product/${item.id}`" class="search-view__card-link">
          <img :src="item.image1" :alt="item.name" class="search-view__card-image" />
          <div class="search-view__card-body">
            <h3>{{ item.name }}</h3>
            <p class="search-view__card-price">￥{{ item.price?.toFixed(2) ?? '—' }}</p>
            <p class="search-view__card-intro">{{ item.intro }}</p>
          </div>
        </RouterLink>
      </li>
    </ul>
  </section>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, RouterLink } from 'vue-router';
import axios from 'axios';

const route = useRoute();
const results = ref([]);
const loading = ref(false);
const error = ref('');

const keyword = computed(() => (route.query.q ? String(route.query.q) : ''));

const fetchResults = async () => {
  if (!keyword.value) {
    results.value = [];
    return;
  }

  loading.value = true;
  error.value = '';

  try {
    const { data } = await axios.get(
      `http://localhost:3000/api/goods/search`,
      {
        params: { query: keyword.value },
      },
    );
    results.value = Array.isArray(data) ? data : [];
  } catch (err) {
    console.error('Failed to fetch search results:', err);
    error.value = '获取搜索结果失败，请稍后重试。';
  } finally {
    loading.value = false;
  }
};

onMounted(fetchResults);

watch(
  () => route.query.q,
  () => {
    fetchResults();
  },
);
</script>

<style scoped>
.search-view {
  max-width: 1080px;
  margin: 0 auto;
  padding: 32px 16px 64px;
}

.search-view__header {
  margin-bottom: 24px;
  text-align: left;
  color: #2703A6;
}

.search-view__header h2 {
  margin: 0;
  font-size: 2rem;
}

.search-view__header p {
  margin: 6px 0 0;
  font-size: 1rem;
  color: rgba(39, 3, 166, 0.8);
}

.search-view__status {
  text-align: center;
  padding: 32px 0;
  color: rgba(39, 3, 166, 0.85);
}

.search-view__status--error {
  color: #d93025;
}

.search-view__grid {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 24px;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
}

.search-view__card {
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(39, 3, 166, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.search-view__card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 40px rgba(39, 3, 166, 0.18);
}

.search-view__card-link {
  display: flex;
  flex-direction: column;
  text-decoration: none;
  color: inherit;
  height: 100%;
}

.search-view__card-image {
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
}

.search-view__card-body {
  padding: 16px;
  text-align: left;
}

.search-view__card-body h3 {
  margin: 0 0 8px;
  font-size: 1.1rem;
  color: #2703A6;
}

.search-view__card-price {
  margin: 0 0 12px;
  font-weight: 700;
  color: #ff5a5f;
}

.search-view__card-intro {
  margin: 0;
  font-size: 0.92rem;
  color: #444;
  line-height: 1.4;
  max-height: 3.6em;
  overflow: hidden;
}
</style>
