<template>
  <div class="search-bar">
    <input
      v-model="searchTerm"
      type="text"
      placeholder="搜索热门商品、口味或系列"
      class="search-bar__input"
    />
    <button type="button" class="search-bar__button" @click="submitSearch">
      搜索
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const searchTerm = ref('');

const submitSearch = () => {
  if (!searchTerm.value.trim()) {
    return;
  }

  router.push({ path: '/search', query: { q: searchTerm.value.trim() } });
};
</script>

<style scoped>
.search-bar {
  width: min(720px, 90vw);
  margin: 32px auto;
  display: flex;
  align-items: center;
  gap: 12px;
}

.search-bar__input {
  flex: 1;
  padding: 14px 16px;
  border-radius: 999px;
  border: 2px solid rgba(39, 3, 166, 0.25);
  font-size: 1rem;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.search-bar__input:focus {
  outline: none;
  border-color: #2703A6;
  box-shadow: 0 0 0 4px rgba(39, 3, 166, 0.12);
}

.search-bar__button {
  padding: 12px 24px;
  background: linear-gradient(120deg, #2703A6, #6b4cff);
  color: #fff;
  border: none;
  border-radius: 999px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.search-bar__button:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(39, 3, 166, 0.25);
}
</style>
