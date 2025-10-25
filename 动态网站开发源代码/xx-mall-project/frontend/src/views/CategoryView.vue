<template>
  <div class="category-view" :style="categoryStyle">
    <TopNavigation />
    <main class="category-main">
      <section v-if="loading" class="category-status">
        正在加载 {{ categoryId ? `「${categoryId}」` : '' }} 系列的商品...
      </section>

      <section v-else-if="error" class="category-status category-status--error">
        {{ error }}
        <RouterLink to="/" class="category-status__link">返回首页</RouterLink>
      </section>

      <template v-else-if="category">
        <section class="category-hero">
          <span class="category-hero__badge">{{ category.name }}</span>
          <h1 class="category-hero__title">
            {{ categoryDetails.tagline || `${category.name} 精选` }}
          </h1>
          <p class="category-hero__description">{{ categoryDetails.description }}</p>

          <ul v-if="categoryDetails.keywords?.length" class="category-hero__keywords">
            <li v-for="keyword in categoryDetails.keywords" :key="keyword">{{ keyword }}</li>
          </ul>

          <dl class="category-hero__meta">
            <div v-if="categoryDetails.season" class="category-hero__meta-item">
              <dt>适合场景</dt>
              <dd>{{ categoryDetails.season }}</dd>
            </div>
            <div v-if="categoryDetails.serving" class="category-hero__meta-item">
              <dt>推荐搭配</dt>
              <dd>{{ categoryDetails.serving }}</dd>
            </div>
          </dl>
        </section>

        <section v-if="categoryDetails.highlights?.length" class="category-highlights">
          <h2 class="category-highlights__title">{{ category.name }} 亮点速览</h2>
          <ul class="category-highlights__list">
            <li v-for="highlight in categoryDetails.highlights" :key="highlight">{{ highlight }}</li>
          </ul>
        </section>

        <section class="category-goods">
          <header class="category-goods__header">
            <h2>精选商品</h2>
            <p v-if="filteredGoods.length">{{ categoryDetails.tip }}</p>
            <p v-else>这个系列的商品正在补货中，逛逛其他系列吧。</p>
          </header>

          <div v-if="filteredGoods.length" class="category-goods__grid">
            <ContentCard
              v-for="item in filteredGoods"
              :key="item.id"
              :image-src="getImageSrc(item.image1)"
              :image-alt="item.name || '商品'"
              :category="category?.name || '系列商品'"
              :heading="item.name || '未命名商品'"
              :author-name="formatPrice(item.price)"
              :author-meta="item.intro"
              @select-card="() => handleGoodsClick(item)"
            >
              <template #author>
                <span class="category-goods__price">{{ formatPrice(item.price) }}</span>
              </template>
            </ContentCard>
          </div>

          <div v-else class="category-empty">
            <p>抱歉，暂时没有找到这个系列的商品。</p>
            <RouterLink to="/" class="category-empty__link">前往首页探索更多</RouterLink>
          </div>
        </section>
      </template>

      <section v-else class="category-missing">
        <h2>没有找到对应的分类</h2>
        <p>可能是链接已过期或还在筹备中。</p>
        <RouterLink to="/" class="category-status__link">返回首页</RouterLink>
      </section>
    </main>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { useRoute, RouterLink } from 'vue-router';
import axios from 'axios';
import TopNavigation from '@/components/TopNavigation.vue';
import ContentCard from '@/components/ContentCard.vue';

const CATEGORY_LIBRARY = Object.freeze({
  default: {
    tagline: '探索灵感甜品',
    description: '我们正在为这一系列补充更多故事，先看看其他上新的甜点吧。',
    keywords: ['匠心制作', '每日新鲜', '冷链配送'],
    highlights: [
      '精选进口乳脂与当季食材，保留原味质感',
      '全程冷链配送，确保到手依旧丝滑新鲜',
      '团队每日评审热销数据，及时更新推荐列表',
    ],
    season: '适合全年分享的甜蜜时刻',
    serving: '搭配花草茶或轻盈气泡水',
    tip: '你也可以回到首页，看看今日口碑热卖单品。',
    accent: '#2703a6',
    accentSoft: 'rgba(39, 3, 166, 0.12)',
  },
  1: {
    tagline: '冰爽灵感，一口融化夏日',
    description:
      '从经典香草到季节限定雪葩，用慢速搅拌锁住空气感，只为那一瞬间的绵密与清爽。',
    keywords: ['轻盈低脂', '当季鲜果', '夏日限定'],
    highlights: [
      '每日小批量慢速搅拌，保持空气感与柔滑口感',
      '精选当季鲜果搭配比利时巧克力，甜度纯粹不粘腻',
      '全程 -18°C 冷链配送，确保送达依旧顺滑细腻',
    ],
    season: '夏日晚风、假日泳池与解暑时刻',
    serving: '搭配脆筒、法式薄饼或清爽气泡水',
    tip: '将冰淇淋提前 5 分钟置于常温，可获得最完美的拉丝口感。',
    accent: '#3bbdff',
    accentSoft: 'rgba(59, 189, 255, 0.15)',
  },
  2: {
    tagline: '即刻解馋的零食派对',
    description:
      '咸甜交替的零食灵感，从办公室的小确幸到追剧夜的绝佳伴侣，让味蕾随时在线。',
    keywords: ['口袋美味', '咸甜切换', '随手即享'],
    highlights: [
      '严选进口黄油与天然奶油，松脆不油腻',
      '甜咸搭配组合装，随心搭配满足不同心情',
      '独立包装设计，分享也能保持最佳风味',
    ],
    season: '午后茶歇与好友聚会的解馋时刻',
    serving: '搭配冷萃咖啡或鲜奶茶，风味更出众',
    tip: '想要酥脆升级？食用前放进 150°C 烤箱复热 3 分钟。',
    accent: '#ff8a3d',
    accentSoft: 'rgba(255, 138, 61, 0.16)',
  },
  3: {
    tagline: '童趣与营养兼得的甜蜜星球',
    description:
      '低糖配方与趣味造型的结合，让孩子的味蕾与创意同步绽放，每一口都充满惊喜。',
    keywords: ['低糖低负担', '趣味造型', '亲子时光'],
    highlights: [
      '减少 40% 精制糖，改以天然果蔬粉调色',
      '通过多项儿童食品检测，温和口感更安心',
      '附赠 DIY 手作卡片，亲子一起完成小小甜点师任务',
    ],
    season: '生日派对、亲子下午茶与节日分享',
    serving: '搭配温牛奶或鲜榨果汁更受欢迎',
    tip: '将造型配件收纳起来，二次创作属于自己的甜品陈列台。',
    accent: '#ff9ccc',
    accentSoft: 'rgba(255, 156, 204, 0.22)',
  },
  4: {
    tagline: '法式浪漫，从味蕾开始',
    description:
      '黄油香气与香缇奶油在手工折叠中交织，每一层酥脆都承载着地道法式的优雅气息。',
    keywords: ['奶油香气', '精致层次', '浪漫法式'],
    highlights: [
      '采用法国 AOP 黄油与伊斯尼淡奶油，口感醇厚富有层次',
      '经典工序手工折叠，达到 27 层黄金酥脆结构',
      '每日限定烘烤时段，锁住最充盈的奶香',
    ],
    season: '纪念日、私享下午茶与仪式感时刻',
    serving: '搭配香槟、红茶或轻盈花香白葡萄酒',
    tip: '室温静置 8 分钟后品尝，可最大化奶香的绽放。',
    accent: '#b48dff',
    accentSoft: 'rgba(180, 141, 255, 0.18)',
  },
  5: {
    tagline: '历久弥新的经典之选',
    description:
      '传承店内口碑款，配方与火候层层把关，不用冒险就能收获稳稳的感动。',
    keywords: ['必点单品', '匠心配方', '零失误送礼'],
    highlights: [
      '多年热卖配方，甜度与口感获得百万顾客验证',
      '以原味呈现食材本香，重温记忆中最熟悉的味道',
      '礼盒包装可选刻字服务，送礼也不过分张扬',
    ],
    season: '日常犒赏、自留或探访亲友的安心之选',
    serving: '搭配热咖啡或红茶最能体现平衡感',
    tip: '若需冷藏保存，食用前室温回温 15 分钟口感更佳。',
    accent: '#f6b73c',
    accentSoft: 'rgba(246, 183, 60, 0.18)',
  },
  8: {
    tagline: '节日限定，氛围感拉满',
    description:
      '以节日灵感打造限定配色与风味，让甜品承担起仪式感与祝福心意。',
    keywords: ['限定配色', '节日礼遇', '氛围感'],
    highlights: [
      '节日限定口味限期开烤，错过即等待来年',
      '附赠节日主题手写卡片，祝福更有温度',
      '多组人数份量可选，轻松应对家庭聚会',
    ],
    season: '圣诞、春节、情人节等节庆节点',
    serving: '搭配热红酒或香料奶茶倍增节日气氛',
    tip: '提前预订可享专属包装服务，支持上门自提与外送。',
    accent: '#ff5470',
    accentSoft: 'rgba(255, 84, 112, 0.18)',
  },
  11: {
    tagline: '奢享系列，偶尔也要犒赏自己',
    description:
      '来自世界各地的珍稀食材在此汇聚，限定编号让每一次开盒都值得铭记。',
    keywords: ['奢华风味', '限量臻选', '尊享体验'],
    highlights: [
      '甄选马达加斯加波旁香草籽与明治 63% 黑巧克力',
      '与精品酒庄共创风味联名款，口感层次更耐细品',
      '附专属品鉴手册与餐具套组，完整呈现仪式感',
    ],
    season: '私人聚会、高端商务礼与纪念时刻',
    serving: '搭配单一麦芽威士忌或年份香槟，风味相得益彰',
    tip: '建议 4°C 冰镇后品尝，并配合品鉴手册顺序体验口感变化。',
    accent: '#5d4e9b',
    accentSoft: 'rgba(93, 78, 155, 0.2)',
  },
});

const route = useRoute();
const categoryId = ref(route.params.id);
const category = ref(null);
const goods = ref([]);
const loading = ref(true);
const error = ref('');

const numericCategoryId = computed(() => {
  const id = Number(categoryId.value);
  return Number.isFinite(id) ? id : null;
});

const categoryDetails = computed(() => {
  return CATEGORY_LIBRARY[numericCategoryId.value] || CATEGORY_LIBRARY.default;
});

const categoryStyle = computed(() => ({
  '--category-accent': categoryDetails.value.accent || '#2703a6',
  '--category-accent-soft': categoryDetails.value.accentSoft || 'rgba(39, 3, 166, 0.12)',
}));

const filteredGoods = computed(() => {
  if (!category.value) {
    return [];
  }

  const targetId = String(category.value.id);
  return goods.value.filter((item) => {
    const typeId = item?.type?.id ?? item?.type_id;
    return String(typeId ?? '') === targetId;
  });
});

const formatPrice = (price) => {
  if (price === null || price === undefined) {
    return '价格待定';
  }
  const numericPrice = Number(price);
  return Number.isFinite(numericPrice) ? `¥${numericPrice.toFixed(2)}` : '价格待定';
};

const getImageSrc = (path) => {
  if (!path) {
    return '';
  }
  return path.startsWith('/') ? path : `/${path}`;
};

const handleGoodsClick = (goodsItem) => {
  console.log('Selected goods:', goodsItem);
};

const loadCategory = async (id) => {
  if (!id) {
    category.value = null;
    goods.value = [];
    loading.value = false;
    return;
  }

  loading.value = true;
  error.value = '';

  try {
    const [typeResponse, goodsResponse] = await Promise.all([
      axios.get('http://localhost:3000/api/type'),
      axios.get('http://localhost:3000/api/goods'),
    ]);

    const typeList = Array.isArray(typeResponse.data) ? typeResponse.data : [];
    category.value = typeList.find((item) => String(item.id) === String(id)) || null;

    goods.value = Array.isArray(goodsResponse.data) ? goodsResponse.data : [];
  } catch (err) {
    console.error('加载分类失败:', err);
    error.value = '加载分类失败，请稍后重试。';
    category.value = null;
    goods.value = [];
  } finally {
    loading.value = false;
  }
};

watch(
  () => route.params.id,
  (newId) => {
    categoryId.value = newId;
    void loadCategory(newId);
  },
  { immediate: true },
);
</script>

<style scoped>
.category-view {
  --category-accent: #2703a6;
  --category-accent-soft: rgba(39, 3, 166, 0.12);
  min-height: 100vh;
  background: #f5f7fb;
  display: flex;
  flex-direction: column;
}

.category-main {
  flex: 1;
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
  padding: 32px 16px 96px;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.category-status {
  background: #fff;
  border-radius: 20px;
  padding: 32px;
  text-align: center;
  color: #2703a6;
  box-shadow: 0 16px 40px rgba(39, 3, 166, 0.12);
  border: 1px solid rgba(39, 3, 166, 0.12);
  font-size: 1.05rem;
}

.category-status--error {
  color: #d93025;
}

.category-status__link {
  display: inline-block;
  margin-top: 16px;
  padding: 10px 22px;
  border-radius: 999px;
  background: #2703a6;
  color: #fff;
  text-decoration: none;
  font-weight: 600;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.category-status__link:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 30px rgba(39, 3, 166, 0.25);
}

.category-hero {
  position: relative;
  overflow: hidden;
  border-radius: 28px;
  padding: 40px 32px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.94), #fff);
  box-shadow: 0 22px 60px rgba(39, 3, 166, 0.12);
  border: 1px solid rgba(39, 3, 166, 0.08);
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.category-hero::before,
.category-hero::after {
  content: '';
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle, var(--category-accent) 0%, transparent 70%);
  opacity: 0.28;
  pointer-events: none;
}

.category-hero::before {
  width: 360px;
  height: 360px;
  top: -180px;
  right: -120px;
}

.category-hero::after {
  width: 260px;
  height: 260px;
  bottom: -120px;
  left: -80px;
  background: radial-gradient(circle, var(--category-accent-soft) 0%, transparent 70%);
  opacity: 1;
}

.category-hero__badge {
  align-self: flex-start;
  padding: 8px 16px;
  border-radius: 999px;
  background: rgba(39, 3, 166, 0.08);
  color: #2703a6;
  font-weight: 600;
  letter-spacing: 0.02em;
  z-index: 1;
}

.category-hero__title {
  margin: 0;
  font-size: clamp(1.8rem, 2.5vw, 2.6rem);
  color: #1f1f1f;
  line-height: 1.2;
  z-index: 1;
}

.category-hero__description {
  margin: 0;
  font-size: 1.05rem;
  line-height: 1.7;
  color: #445069;
  z-index: 1;
}

.category-hero__keywords {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 0;
  margin: 0;
  list-style: none;
  z-index: 1;
}

.category-hero__keywords li {
  padding: 8px 14px;
  border-radius: 999px;
  background: var(--category-accent-soft);
  color: #2a2b38;
  font-weight: 600;
  font-size: 0.9rem;
}

.category-hero__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  margin: 0;
  z-index: 1;
}

.category-hero__meta-item {
  min-width: 180px;
}

.category-hero__meta-item dt {
  margin: 0 0 6px;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgba(39, 3, 166, 0.7);
}

.category-hero__meta-item dd {
  margin: 0;
  color: #1f1f1f;
  font-weight: 600;
  font-size: 1rem;
}

.category-highlights {
  background: #fff;
  border-radius: 24px;
  padding: 32px;
  box-shadow: 0 18px 45px rgba(39, 3, 166, 0.1);
  border: 1px solid rgba(39, 3, 166, 0.1);
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.category-highlights__title {
  margin: 0;
  font-size: 1.4rem;
  color: #2703a6;
}

.category-highlights__list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 14px;
}

.category-highlights__list li {
  padding: 16px 18px;
  border-radius: 16px;
  background: linear-gradient(90deg, rgba(39, 3, 166, 0.05), rgba(39, 3, 166, 0));
  color: #39414f;
  border: 1px solid rgba(39, 3, 166, 0.08);
  position: relative;
  padding-left: 44px;
}

.category-highlights__list li::before {
  content: '★';
  position: absolute;
  left: 18px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--category-accent);
  font-size: 0.9rem;
}

.category-goods {
  background: #fff;
  border-radius: 24px;
  padding: 32px;
  box-shadow: 0 18px 45px rgba(39, 3, 166, 0.1);
  border: 1px solid rgba(39, 3, 166, 0.1);
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.category-goods__header h2 {
  margin: 0;
  font-size: 1.4rem;
  color: #2703a6;
}

.category-goods__header p {
  margin: 8px 0 0;
  color: #4b5563;
}

.category-goods__grid {
  display: grid;
  gap: 24px;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  justify-items: center;
}

.category-goods__price {
  color: #2703a6;
  font-weight: 600;
  font-size: 1rem;
}

.category-empty {
  text-align: center;
  padding: 24px;
  color: #4b5563;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.category-empty__link {
  align-self: center;
  padding: 10px 22px;
  border-radius: 999px;
  border: 1px solid #2703a6;
  text-decoration: none;
  color: #2703a6;
  font-weight: 600;
  transition: all 0.2s ease;
}

.category-empty__link:hover {
  background-color: rgba(39, 3, 166, 0.08);
}

.category-missing {
  background: #fff;
  border-radius: 24px;
  padding: 40px;
  text-align: center;
  box-shadow: 0 16px 40px rgba(39, 3, 166, 0.12);
  border: 1px solid rgba(39, 3, 166, 0.12);
  color: #4b5563;
}

.category-missing h2 {
  margin-top: 0;
  color: #2703a6;
}

@media (max-width: 768px) {
  .category-main {
    padding: 24px 16px 80px;
  }

  .category-hero {
    padding: 32px 24px;
  }

  .category-highlights,
  .category-goods {
    padding: 24px 20px;
  }

  .category-highlights__list li {
    padding-left: 38px;
  }
}
</style>
