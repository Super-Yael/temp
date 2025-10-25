<template>
  <div class="orders-view">
    <TopNavigation />
    <main class="orders-main">
      <header class="orders-header">
        <h1>我的订单</h1>
        <p class="orders-header__subtitle">随时查看订单进度，合理安排收货</p>
      </header>

      <nav class="orders-tabs" aria-label="订单状态筛选">
        <button
          v-for="option in statusOptions"
          :key="option.value"
          type="button"
          class="orders-tab"
          :class="{ 'orders-tab--active': currentStatus === option.value }"
          @click="handleStatusChange(option.value)"
        >
          {{ option.label }}
        </button>
      </nav>

      <div
        v-if="feedback.text"
        :class="['orders-feedback', `orders-feedback--${feedback.type}`]"
        role="status"
      >
        {{ feedback.text }}
      </div>

      <section v-if="loading" class="orders-status">正在加载订单...</section>
      <section v-else-if="error" class="orders-status orders-status--error">
        {{ error }}
      </section>
      <section v-else-if="!orders.length" class="orders-empty">
        <p>还没有相关订单，去挑选喜欢的商品吧。</p>
        <RouterLink to="/" class="orders-empty__action">前往首页</RouterLink>
      </section>
      <section v-else class="orders-list">
        <article v-for="order in orders" :key="order.id" class="orders-card">
          <header class="orders-card__header">
            <div>
              <h2 class="orders-card__number">订单号：{{ order.orderNumber }}</h2>
              <p class="orders-card__date">创建时间：{{ formatDate(order.createdAt) }}</p>
            </div>
            <span
              class="orders-card__status"
              :class="`orders-card__status--${order.status}`"
            >
              {{ formatStatus(order.status) }}
            </span>
          </header>

          <ul class="orders-card__items">
            <li v-for="item in order.items || []" :key="item.id" class="orders-card__item">
              <div class="orders-card__item-info">
                <h3 class="orders-card__item-name">{{ item.goodsName }}</h3>
                <p class="orders-card__item-quantity">数量：{{ item.quantity }}</p>
              </div>
              <div class="orders-card__item-prices">
                <span class="orders-card__item-price">单价：{{ formatPrice(item.goodsPrice) }}</span>
                <span class="orders-card__item-subtotal">小计：{{ formatPrice(item.subtotalAmount) }}</span>
              </div>
            </li>
          </ul>

          <footer class="orders-card__footer">
            <span class="orders-card__total">合计：{{ formatPrice(order.totalAmount) }}</span>
            <div
              v-if="order.status === 'pending_payment'"
              class="orders-card__actions"
            >
              <button
                type="button"
                class="orders-card__button"
                @click="handlePay(order)"
              >
                去支付
              </button>
              <button
                type="button"
                class="orders-card__button orders-card__button--ghost"
                @click="handleCancel(order)"
              >
                取消订单
              </button>
            </div>
          </footer>
        </article>
      </section>
      <transition name="fade">
        <div v-if="paymentModal.visible" class="orders-modal">
          <div class="orders-modal__backdrop" @click="handleClosePayment"></div>
          <section class="orders-modal__panel" role="dialog" aria-modal="true">
            <header class="orders-modal__header">
              <h2>选择支付方式</h2>
              <button type="button" class="orders-modal__close" @click="handleClosePayment">
                ×
              </button>
            </header>
            <div class="orders-modal__content">
              <div class="orders-modal__channels" role="tablist">
                <button
                  type="button"
                  class="orders-modal__channel"
                  :class="{ 'orders-modal__channel--active': paymentModal.channel === 'wechat' }"
                  @click="handlePaymentChannelChange('wechat')"
                >
                  <span class="orders-modal__channel-icon orders-modal__channel-icon--wechat" aria-hidden="true"></span>
                  微信支付
                </button>
                <button
                  type="button"
                  class="orders-modal__channel"
                  :class="{ 'orders-modal__channel--active': paymentModal.channel === 'alipay' }"
                  @click="handlePaymentChannelChange('alipay')"
                >
                  <span class="orders-modal__channel-icon orders-modal__channel-icon--alipay" aria-hidden="true"></span>
                  支付宝支付
                </button>
              </div>
              <p class="orders-modal__hint">
                模拟支付流程，请在完成支付后点击 "已完成支付"，否则请选择 "未完成支付" 继续等待。
              </p>
            </div>
            <footer class="orders-modal__footer">
              <button
                type="button"
                class="orders-modal__action orders-modal__action--ghost"
                @click="handlePaymentResult(false)"
              >
                未完成支付
              </button>
              <button
                type="button"
                class="orders-modal__action"
                @click="handlePaymentResult(true)"
              >
                已完成支付
              </button>
            </footer>
          </section>
        </div>
      </transition>
    </main>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import TopNavigation from '@/components/TopNavigation.vue';
import { ordersStore } from '@/store/orders';
import { auth } from '@/store/auth';

const orderStore = ordersStore;
const authStore = auth;
const route = useRoute();
const router = useRouter();

const statusOptions = computed(() => orderStore.statusOptions.value || []);
const loading = computed(() => orderStore.loading.value);
const error = computed(() => orderStore.error.value);
const orders = computed(() => orderStore.orders.value || []);
const statusLabelMap = computed(() => orderStore.statusLabelMap.value || {});
const paymentModal = computed(() => orderStore.paymentModalState.value || {
  visible: false,
  channel: 'wechat',
});

const currentStatus = ref('all');
const feedback = ref({ type: '', text: '' });
let feedbackTimer = null;

const normalizeStatus = (rawStatus) => {
  const available = new Set(statusOptions.value.map((option) => option.value));
  return available.has(rawStatus) ? rawStatus : 'all';
};

const syncStatusFromRoute = () => {
  const { status } = route.query;
  currentStatus.value = normalizeStatus(status);
};

const handleStatusChange = (status) => {
  if (currentStatus.value === status) {
    return;
  }
  const query = status && status !== 'all' ? { status } : {};
  router.push({ name: 'orders', query }).catch(() => {});
};

const ensureOrdersLoaded = async () => {
  if (!authStore.user.value) {
    return;
  }
  await orderStore.ensureStatusOptions();
  await orderStore.loadOrders(currentStatus.value);
};

const formatPrice = (value) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return '¥0.00';
  }
  return `¥${numeric.toFixed(2)}`;
};

const formatDate = (value) => {
  if (!value) {
    return '时间待定';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '时间待定';
  }
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate(),
  ).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(
    date.getMinutes(),
  ).padStart(2, '0')}`;
};

const formatStatus = (status) => {
  return statusLabelMap.value[status] || '未知状态';
};

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

const handlePay = (order) => {
  orderStore.openPaymentModal(order.id, authStore.user.value?.id);
};

const handleCancel = async (order) => {
  const result = await orderStore.cancelOrder(order.id);
  showFeedback(result.success ? 'success' : 'error', result.message);
};

const handlePaymentChannelChange = (channel) => {
  orderStore.setPaymentChannel(channel);
};

const handlePaymentResult = async (paid) => {
  const result = await orderStore.confirmPaymentStatus(paid);
  showFeedback(result.success ? 'success' : 'error', result.message);
};

const handleClosePayment = () => {
  orderStore.closePaymentModal();
};

onMounted(async () => {
  await orderStore.ensureStatusOptions();
  syncStatusFromRoute();
  await ensureOrdersLoaded();
});

watch(
  () => route.query.status,
  async () => {
    syncStatusFromRoute();
    await ensureOrdersLoaded();
  },
);

watch(
  () => authStore.user.value?.id,
  async () => {
    await ensureOrdersLoaded();
  },
);

onBeforeUnmount(() => {
  if (feedbackTimer) {
    clearTimeout(feedbackTimer);
  }
});
</script>

<style scoped>
.orders-view {
  min-height: 100vh;
  background: #f5f7fb;
  display: flex;
  flex-direction: column;
}

.orders-main {
  flex: 1;
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
  padding: 32px 16px 96px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.orders-header {
  background: #fff;
  border-radius: 24px;
  padding: 28px;
  box-shadow: 0 18px 45px rgba(39, 3, 166, 0.1);
  border: 1px solid rgba(39, 3, 166, 0.1);
}

.orders-header h1 {
  margin: 0;
  font-size: 1.8rem;
  color: #2703a6;
}

.orders-header__subtitle {
  margin: 8px 0 0;
  color: rgba(39, 3, 166, 0.7);
  font-weight: 600;
}

.orders-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.orders-tab {
  padding: 10px 18px;
  border-radius: 999px;
  border: 1px solid transparent;
  background: rgba(39, 3, 166, 0.1);
  color: #2703a6;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
}

.orders-tab:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 24px rgba(39, 3, 166, 0.15);
}

.orders-tab--active {
  background: linear-gradient(135deg, #2703a6, #6c2cf5);
  color: #fff;
  box-shadow: 0 12px 28px rgba(39, 3, 166, 0.22);
}

.orders-feedback {
  background: rgba(39, 3, 166, 0.08);
  border: 1px solid rgba(39, 3, 166, 0.18);
  border-radius: 16px;
  padding: 14px 18px;
  color: #2703a6;
  font-weight: 600;
}

.orders-feedback--success {
  background: rgba(42, 122, 56, 0.12);
  border-color: rgba(42, 122, 56, 0.3);
  color: #2a7a38;
}

.orders-feedback--error {
  background: rgba(217, 48, 37, 0.12);
  border-color: rgba(217, 48, 37, 0.3);
  color: #b52119;
}

.orders-status {
  background: #fff;
  border-radius: 24px;
  padding: 28px;
  text-align: center;
  color: #2703a6;
  font-weight: 600;
  box-shadow: 0 18px 45px rgba(39, 3, 166, 0.1);
  border: 1px solid rgba(39, 3, 166, 0.1);
}

.orders-status--error {
  color: #d93025;
}

.orders-empty {
  background: #fff;
  border-radius: 24px;
  padding: 40px 28px;
  text-align: center;
  color: rgba(39, 3, 166, 0.7);
  box-shadow: 0 18px 45px rgba(39, 3, 166, 0.1);
  border: 1px solid rgba(39, 3, 166, 0.1);
}

.orders-empty__action {
  display: inline-block;
  margin-top: 18px;
  padding: 10px 22px;
  border-radius: 999px;
  background: linear-gradient(135deg, #2703a6, #6c2cf5);
  color: #fff;
  text-decoration: none;
  font-weight: 600;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.orders-empty__action:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 30px rgba(39, 3, 166, 0.22);
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.orders-card {
  background: #fff;
  border-radius: 24px;
  padding: 24px;
  box-shadow: 0 18px 45px rgba(39, 3, 166, 0.1);
  border: 1px solid rgba(39, 3, 166, 0.08);
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.orders-card__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.orders-card__number {
  margin: 0;
  font-size: 1.1rem;
  color: #2703a6;
}

.orders-card__date {
  margin: 6px 0 0;
  color: rgba(39, 3, 166, 0.7);
  font-weight: 600;
}

.orders-card__status {
  padding: 6px 14px;
  border-radius: 999px;
  background: rgba(39, 3, 166, 0.12);
  color: #2703a6;
  font-weight: 700;
  font-size: 0.95rem;
}

.orders-card__status--awaiting_shipment {
  background: rgba(39, 3, 166, 0.12);
  color: #2703a6;
}

.orders-card__status--pending_payment {
  background: rgba(255, 138, 61, 0.12);
  color: #ff6b3d;
}

.orders-card__status--shipped {
  background: rgba(59, 189, 255, 0.18);
  color: #1a7fbf;
}

.orders-card__status--completed {
  background: rgba(60, 180, 75, 0.18);
  color: #2a7a38;
}

.orders-card__status--cancelled {
  background: rgba(120, 120, 120, 0.16);
  color: #555a64;
}

.orders-card__items {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.orders-card__item {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  background: rgba(39, 3, 166, 0.05);
  border-radius: 16px;
  padding: 14px 16px;
  border: 1px solid rgba(39, 3, 166, 0.08);
}

.orders-card__item-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.orders-card__item-name {
  margin: 0;
  font-size: 1rem;
  color: #2703a6;
}

.orders-card__item-quantity {
  margin: 0;
  color: rgba(39, 3, 166, 0.7);
  font-weight: 600;
}

.orders-card__item-prices {
  display: flex;
  flex-direction: column;
  gap: 6px;
  text-align: right;
  color: #4b5563;
  font-weight: 600;
}

.orders-card__item-price {
  color: rgba(39, 3, 166, 0.7);
}

.orders-card__item-subtotal {
  color: #2703a6;
}

.orders-card__footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.orders-card__total {
  font-size: 1.2rem;
  font-weight: 700;
  color: #2703a6;
}

.orders-card__actions {
  display: flex;
  gap: 10px;
}

.orders-card__button {
  padding: 8px 16px;
  border-radius: 999px;
  border: none;
  background: linear-gradient(135deg, #2703a6, #6c2cf5);
  color: #fff;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;
}

.orders-card__button:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 28px rgba(39, 3, 166, 0.2);
}

.orders-card__button:active {
  opacity: 0.85;
}

.orders-card__button--ghost {
  background: transparent;
  border: 1px solid rgba(39, 3, 166, 0.3);
  color: #2703a6;
  box-shadow: none;
}

.orders-card__button--ghost:hover {
  box-shadow: 0 10px 20px rgba(39, 3, 166, 0.12);
}

@media (max-width: 768px) {
  .orders-card__item {
    flex-direction: column;
    text-align: left;
  }

  .orders-card__item-prices {
    text-align: left;
  }

  .orders-card__actions {
    width: 100%;
    justify-content: flex-start;
    flex-wrap: wrap;
  }
}

.orders-modal {
  position: fixed;
  inset: 0;
  z-index: 1200;
  display: flex;
  align-items: center;
  justify-content: center;
}

.orders-modal__backdrop {
  position: absolute;
  inset: 0;
  background: rgba(17, 24, 39, 0.45);
}

.orders-modal__panel {
  position: relative;
  background: #ffffff;
  border-radius: 20px;
  width: min(480px, calc(100% - 32px));
  padding: 24px;
  box-shadow: 0 30px 80px rgba(39, 3, 166, 0.22);
  display: flex;
  flex-direction: column;
  gap: 20px;
  z-index: 1;
}

.orders-modal__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.orders-modal__header h2 {
  margin: 0;
  font-size: 1.3rem;
  color: #2703a6;
}

.orders-modal__close {
  border: none;
  background: none;
  font-size: 1.6rem;
  line-height: 1;
  cursor: pointer;
  color: #2703a6;
}

.orders-modal__content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.orders-modal__channels {
  display: flex;
  gap: 12px;
}

.orders-modal__channel {
  flex: 1;
  padding: 14px;
  border-radius: 14px;
  border: 1px solid rgba(39, 3, 166, 0.18);
  background: rgba(39, 3, 166, 0.05);
  color: #2703a6;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}

.orders-modal__channel:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 24px rgba(39, 3, 166, 0.18);
}

.orders-modal__channel--active {
  background: linear-gradient(135deg, #2703a6, #6c2cf5);
  border-color: transparent;
  color: #ffffff;
  box-shadow: 0 16px 30px rgba(39, 3, 166, 0.22);
}

.orders-modal__channel-icon {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  display: inline-block;
}

.orders-modal__channel-icon--wechat {
  background: #1aad19;
}

.orders-modal__channel-icon--alipay {
  background: #1678ff;
}

.orders-modal__hint {
  margin: 0;
  color: rgba(39, 3, 166, 0.7);
  font-weight: 500;
  line-height: 1.6;
}

.orders-modal__footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.orders-modal__action {
  padding: 10px 18px;
  border-radius: 999px;
  border: none;
  background: linear-gradient(135deg, #2703a6, #6c2cf5);
  color: #fff;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;
}

.orders-modal__action:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 28px rgba(39, 3, 166, 0.22);
}

.orders-modal__action--ghost {
  background: transparent;
  border: 1px solid rgba(39, 3, 166, 0.3);
  color: #2703a6;
  box-shadow: none;
}

.orders-modal__action--ghost:hover {
  box-shadow: 0 12px 24px rgba(39, 3, 166, 0.12);
}
</style>
