<template>
  <div class="cart-view">
    <TopNavigation />
    <main class="cart-main">
      <section v-if="!isLoggedIn" class="cart-status">
        <p>登录后即可查看和管理购物车。</p>
        <RouterLink to="/login" class="cart-status__action">前往登录</RouterLink>
      </section>

      <section v-else class="cart-content">
        <header class="cart-header">
          <div>
            <h1>购物车</h1>
            <p class="cart-header__subtitle">共 {{ totalItems }} 件商品</p>
          </div>
          <button
            type="button"
            class="cart-header__clear"
            :disabled="!cartItems.length || cartLoading || pendingClear"
            @click="handleClearCart"
          >
            {{ pendingClear ? '清空中...' : '清空购物车' }}
          </button>
        </header>

        <div
          v-if="feedback.text"
          :class="['cart-feedback', `cart-feedback--${feedback.type}`]"
          role="status"
        >
          {{ feedback.text }}
        </div>

        <div v-if="cartLoading" class="cart-status cart-status--secondary">正在加载购物车...</div>
        <div v-else-if="cartError" class="cart-status cart-status--error">
          {{ cartError }}
        </div>
        <div v-else-if="!cartItems.length" class="cart-empty">
          <p>购物车空空如也，去挑选喜欢的甜品吧。</p>
          <RouterLink to="/" class="cart-empty__action">前往首页</RouterLink>
        </div>
        <template v-else>
          <ul class="cart-list">
            <li v-for="item in cartItems" :key="item.id" class="cart-item">
              <div class="cart-item__media">
                <img
                  v-if="getImageSrc(item.goods?.image1)"
                  :src="getImageSrc(item.goods?.image1)"
                  :alt="item.goods?.name || '商品图片'"
                  loading="lazy"
                />
                <div v-else class="cart-item__placeholder" aria-hidden="true">
                  暂无图片
                </div>
              </div>
              <div class="cart-item__info">
                <h2 class="cart-item__name">{{ item.goods?.name || '未命名商品' }}</h2>
                <p class="cart-item__intro">{{ item.goods?.intro || '暂无简介' }}</p>
                <div class="cart-item__meta">
                  <span class="cart-item__price">{{ formatPrice(item.goods?.price) }}</span>
                  <span class="cart-item__subtotal">
                    小计：{{ formatPrice(item.goods?.price * item.quantity) }}
                  </span>
                </div>
              </div>
              <div class="cart-item__actions">
                <div class="cart-quantity">
                  <button
                    type="button"
                    class="cart-quantity__button"
                    :disabled="item.quantity <= 1 || pendingItemId === item.id"
                    @click="handleDecrement(item)"
                  >
                    -
                  </button>
                  <span class="cart-quantity__value">{{ item.quantity }}</span>
                  <button
                    type="button"
                    class="cart-quantity__button"
                    :disabled="pendingItemId === item.id"
                    @click="handleIncrement(item)"
                  >
                    +
                  </button>
                </div>
                <button
                  type="button"
                  class="cart-item__remove"
                  :disabled="pendingItemId === item.id"
                  @click="handleRemove(item)"
                >
                  删除
                </button>
              </div>
            </li>
          </ul>

          <footer class="cart-summary">
            <div class="cart-summary__info">
              <span class="cart-summary__label">合计</span>
              <strong class="cart-summary__value">{{ formatPrice(totalAmount) }}</strong>
            </div>
            <div class="cart-summary__actions">
              <RouterLink to="/" class="cart-summary__continue">继续选购</RouterLink>
              <button
                type="button"
                class="cart-summary__submit"
                :disabled="pendingOrder || pendingClear || !cartItems.length"
                @click="handleSubmitOrder"
              >
                {{ pendingOrder ? '提交中...' : '提交订单' }}
              </button>
            </div>
          </footer>
        </template>
      </section>
    </main>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import TopNavigation from '@/components/TopNavigation.vue';
import { cart } from '@/store/cart';
import { auth } from '@/store/auth';
import { ordersStore } from '@/store/orders';

const cartStore = cart;
const authStore = auth;
const orderStore = ordersStore;
const router = useRouter();

const isLoggedIn = computed(() => Boolean(authStore.token.value && authStore.user.value));
const cartItems = computed(() => cartStore.items.value ?? []);
const cartLoading = computed(() => cartStore.loading.value);
const cartError = computed(() => cartStore.error.value);
const totalItems = computed(() => cartStore.totalItems.value);
const totalAmount = computed(() => cartStore.totalAmount.value);

const feedback = ref({ type: '', text: '' });
const pendingItemId = ref(null);
const pendingClear = ref(false);
const pendingOrder = ref(false);
let feedbackTimer = null;

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

const formatPrice = (price) => {
  const numericPrice = Number(price);
  if (!Number.isFinite(numericPrice)) {
    return '¥0.00';
  }
  return `¥${numericPrice.toFixed(2)}`;
};

const getImageSrc = (path) => {
  if (!path) {
    return '';
  }
  return path.startsWith('/') ? path : `/${path}`;
};

const handleIncrement = async (item) => {
  if (pendingItemId.value) {
    return;
  }
  pendingItemId.value = item.id;
  const result = await cartStore.updateItemQuantity(item.id, item.quantity + 1);
  showFeedback(result.success ? 'success' : 'error', result.message);
  pendingItemId.value = null;
};

const handleDecrement = async (item) => {
  if (pendingItemId.value || item.quantity <= 1) {
    return;
  }
  pendingItemId.value = item.id;
  const result = await cartStore.updateItemQuantity(item.id, item.quantity - 1);
  showFeedback(result.success ? 'success' : 'error', result.message);
  pendingItemId.value = null;
};

const handleRemove = async (item) => {
  if (pendingItemId.value) {
    return;
  }
  pendingItemId.value = item.id;
  const result = await cartStore.removeItem(item.id);
  showFeedback(result.success ? 'success' : 'error', result.message);
  pendingItemId.value = null;
};

const handleClearCart = async () => {
  if (pendingClear.value || !cartItems.value.length) {
    return;
  }
  pendingClear.value = true;
  const result = await cartStore.clearCart();
  showFeedback(result.success ? 'success' : 'error', result.message);
  pendingClear.value = false;
};

const handleSubmitOrder = async () => {
  if (pendingOrder.value || !cartItems.value.length) {
    return;
  }

  if (!isLoggedIn.value) {
    showFeedback('error', '请先登录后再提交订单');
    return;
  }

  pendingOrder.value = true;
  const result = await orderStore.submitOrder();
  pendingOrder.value = false;
  showFeedback(result.success ? 'success' : 'error', result.message);

  if (result.success) {
    router.push({ name: 'orders', query: { status: 'pending_payment' } }).catch(() => {});
  }
};

onMounted(() => {
  if (isLoggedIn.value) {
    cartStore.loadCart().catch((error) => {
      console.error('Failed to load cart:', error);
    });
  }
});

onBeforeUnmount(() => {
  if (feedbackTimer) {
    clearTimeout(feedbackTimer);
  }
});
</script>

<style scoped>
.cart-view {
  min-height: 100vh;
  background: #f5f7fb;
  display: flex;
  flex-direction: column;
}

.cart-main {
  flex: 1;
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
  padding: 32px 16px 96px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.cart-status {
  background: #fff;
  border-radius: 20px;
  padding: 32px;
  text-align: center;
  color: #2703a6;
  box-shadow: 0 16px 40px rgba(39, 3, 166, 0.12);
  border: 1px solid rgba(39, 3, 166, 0.12);
  font-size: 1.05rem;
}

.cart-status--secondary {
  background: rgba(39, 3, 166, 0.06);
  border: 1px dashed rgba(39, 3, 166, 0.2);
  color: #2703a6;
}

.cart-status--error {
  color: #d93025;
}

.cart-status__action {
  display: inline-block;
  margin-top: 16px;
  padding: 10px 22px;
  border-radius: 999px;
  background: linear-gradient(135deg, #2703a6, #6c2cf5);
  color: #fff;
  text-decoration: none;
  font-weight: 600;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.cart-status__action:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 30px rgba(39, 3, 166, 0.25);
}

.cart-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
  background: #fff;
  border-radius: 24px;
  padding: 32px;
  box-shadow: 0 18px 45px rgba(39, 3, 166, 0.1);
  border: 1px solid rgba(39, 3, 166, 0.1);
}

.cart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.cart-header h1 {
  margin: 0;
  font-size: 1.8rem;
  color: #2703a6;
}

.cart-header__subtitle {
  margin: 4px 0 0;
  color: rgba(39, 3, 166, 0.7);
  font-weight: 600;
}

.cart-header__clear {
  padding: 10px 18px;
  border-radius: 999px;
  border: 1px solid rgba(39, 3, 166, 0.24);
  background: transparent;
  color: #2703a6;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease, opacity 0.2s ease;
}

.cart-header__clear:hover:not(:disabled) {
  background: rgba(39, 3, 166, 0.12);
}

.cart-header__clear:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.cart-feedback {
  margin-top: -8px;
  padding: 12px 16px;
  border-radius: 12px;
  font-weight: 600;
}

.cart-feedback--success {
  background: rgba(60, 180, 75, 0.12);
  color: #2a7a38;
}

.cart-feedback--error {
  background: rgba(217, 48, 37, 0.12);
  color: #b52119;
}

.cart-empty {
  text-align: center;
  padding: 24px;
  color: rgba(39, 3, 166, 0.7);
}

.cart-empty__action {
  display: inline-block;
  margin-top: 16px;
  padding: 10px 22px;
  border-radius: 999px;
  background: linear-gradient(135deg, #2703a6, #6c2cf5);
  color: #fff;
  text-decoration: none;
  font-weight: 600;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.cart-empty__action:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 30px rgba(39, 3, 166, 0.25);
}

.cart-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.cart-item {
  display: grid;
  grid-template-columns: 110px 1fr auto;
  gap: 20px;
  padding: 18px;
  border-radius: 18px;
  border: 1px solid rgba(39, 3, 166, 0.1);
  background: rgba(39, 3, 166, 0.04);
}

.cart-item__media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 14px;
  background: #f3f4f6;
}

.cart-item__placeholder {
  width: 100%;
  height: 100%;
  border-radius: 14px;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(39, 3, 166, 0.6);
  font-size: 0.9rem;
}

.cart-item__info {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.cart-item__name {
  margin: 0;
  font-size: 1.2rem;
  color: #2703a6;
}

.cart-item__intro {
  margin: 0;
  color: #4b5563;
  font-size: 0.95rem;
  max-height: 48px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cart-item__meta {
  display: flex;
  gap: 16px;
  align-items: center;
  font-weight: 600;
}

.cart-item__price {
  color: #2703a6;
}

.cart-item__subtotal {
  color: rgba(39, 3, 166, 0.7);
}

.cart-item__actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;
  min-width: 140px;
}

.cart-quantity {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fff;
  border-radius: 999px;
  padding: 6px;
  border: 1px solid rgba(39, 3, 166, 0.12);
}

.cart-quantity__button {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: #2703a6;
  color: #fff;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.cart-quantity__button:hover:not(:disabled) {
  transform: translateY(-1px);
}

.cart-quantity__button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.cart-quantity__value {
  min-width: 24px;
  text-align: center;
  font-weight: 600;
  color: #2703a6;
}

.cart-item__remove {
  border: none;
  background: none;
  color: #d93025;
  font-weight: 600;
  cursor: pointer;
  padding: 6px;
  transition: opacity 0.2s ease;
}

.cart-item__remove:hover:not(:disabled) {
  opacity: 0.7;
}

.cart-item__remove:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.cart-summary {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  flex-wrap: wrap;
  gap: 16px;
  padding-top: 18px;
  border-top: 1px solid rgba(39, 3, 166, 0.12);
}

.cart-summary__info {
  display: flex;
  gap: 12px;
  align-items: baseline;
  color: #4b5563;
}

.cart-summary__label {
  font-weight: 600;
  color: rgba(39, 3, 166, 0.7);
}

.cart-summary__value {
  font-size: 1.6rem;
  color: #2703a6;
}

.cart-summary__actions {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: auto;
}

.cart-summary__actions > * {
  min-width: 130px;
  text-align: center;
}

.cart-summary__continue {
  padding: 10px 20px;
  border-radius: 999px;
  border: 1px solid #2703a6;
  background: transparent;
  color: #2703a6;
  text-decoration: none;
  font-weight: 600;
  transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease, color 0.2s ease;
}

.cart-summary__continue:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 30px rgba(39, 3, 166, 0.12);
  background: rgba(39, 3, 166, 0.06);
}

.cart-summary__submit {
  padding: 10px 20px;
  border-radius: 999px;
  border: none;
  background: linear-gradient(135deg, #2703a6, #6c2cf5);
  color: #fff;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;
}

.cart-summary__submit:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 12px 30px rgba(39, 3, 166, 0.25);
}

.cart-summary__submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .cart-item {
    grid-template-columns: 1fr;
  }

  .cart-item__actions {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
}
</style>
