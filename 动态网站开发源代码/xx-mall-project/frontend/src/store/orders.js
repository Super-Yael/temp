import axios from 'axios';
import { auth } from './auth';
import { cart } from './cart';
import { computed, readonly, ref } from 'vue';

const defaultStatusOptions = [
  { value: 'all', label: '全部订单' },
  { value: 'pending_payment', label: '待支付' },
  { value: 'awaiting_shipment', label: '待发货' },
  { value: 'shipped', label: '已发货' },
  { value: 'completed', label: '已完成' },
  { value: 'cancelled', label: '已取消' },
];

const ordersList = ref([]);
const loading = ref(false);
const error = ref('');
const statusOptions = ref(defaultStatusOptions);
const lastStatus = ref('all');
const statusInitialized = ref(false);
const pendingCount = ref(0);
const paymentModalState = ref({
  visible: false,
  orderId: null,
  userId: null,
  channel: 'wechat',
});

const authStore = auth;
const cartStore = cart;

const getUserId = () => authStore.user.value?.id ?? null;

const extractMessage = (err, fallback) => {
  if (err?.response?.data?.message) {
    return err.response.data.message;
  }
  if (err?.message) {
    return err.message;
  }
  return fallback;
};

const ensureStatusOptions = async () => {
  if (statusInitialized.value) {
    return;
  }
  try {
    const { data } = await axios.get('http://localhost:3000/api/orders/statuses');
    if (Array.isArray(data) && data.length) {
      statusOptions.value = data;
    }
  } catch (err) {
    console.error('Failed to load order status options:', err);
  } finally {
    statusInitialized.value = true;
    await refreshPendingCount();
  }
};

const refreshPendingCount = async () => {
  const userId = getUserId();
  if (!userId) {
    pendingCount.value = 0;
    return;
  }

  try {
    const { data } = await axios.get(
      `http://localhost:3000/api/orders/user/${userId}`,
      {
        params: {
          status: 'pending_payment',
          countOnly: true,
        },
      },
    );
    const count = Number(data?.count ?? 0);
    pendingCount.value = Number.isFinite(count) ? count : 0;
  } catch (err) {
    console.error('Failed to refresh pending order count:', err);
    pendingCount.value = 0;
  }
};

const loadOrders = async (status = 'all') => {
  const userId = getUserId();

  if (!userId) {
    ordersList.value = [];
    lastStatus.value = status;
    return;
  }

  if (loading.value) {
    return;
  }

  loading.value = true;
  error.value = '';
  lastStatus.value = status;

  try {
    const params = {};
    if (status && status !== 'all') {
      params.status = status;
    }

    const { data } = await axios.get(
      `http://localhost:3000/api/orders/user/${userId}`,
      { params },
    );

    ordersList.value = Array.isArray(data) ? data : [];
    if (status === 'pending_payment') {
      pendingCount.value = ordersList.value.length;
    } else {
      await refreshPendingCount();
    }
  } catch (err) {
    error.value = extractMessage(err, '加载订单失败，请稍后再试');
    ordersList.value = [];
    await refreshPendingCount();
  } finally {
    loading.value = false;
  }
};

const submitOrder = async () => {
  const userId = getUserId();
  if (!userId) {
    return {
      success: false,
      message: '请先登录后再提交订单',
    };
  }

  try {
    const { data } = await axios.post('http://localhost:3000/api/orders', {
      userId,
    });

    await Promise.all([
      cartStore.loadCart(true),
      loadOrders('pending_payment'),
      refreshPendingCount(),
    ]);

    return {
      success: true,
      message: '订单已生成，请尽快支付',
      order: data,
    };
  } catch (err) {
    return {
      success: false,
      message: extractMessage(err, '提交订单失败，请稍后再试'),
    };
  }
};

const statusLabelMap = computed(() => {
  return statusOptions.value.reduce((map, option) => {
    map[option.value] = option.label;
    return map;
  }, {});
});

const openPaymentModal = (orderId, userId = getUserId()) => {
  paymentModalState.value = {
    visible: true,
    orderId,
    userId,
    channel: 'wechat',
  };
};

const closePaymentModal = () => {
  paymentModalState.value.visible = false;
  paymentModalState.value.orderId = null;
  paymentModalState.value.userId = null;
  paymentModalState.value.channel = 'wechat';
};

const setPaymentChannel = (channel) => {
  paymentModalState.value.channel = channel;
};

const confirmPaymentStatus = async (paid) => {
  const { orderId, userId } = paymentModalState.value;
  if (!orderId || !userId) {
    closePaymentModal();
    return {
      success: false,
      message: '订单信息缺失，请稍后再试',
    };
  }

  if (!paid) {
    closePaymentModal();
    return { success: true, message: '请完成支付后再回来确认' };
  }

  try {
    await axios.patch(`http://localhost:3000/api/orders/${orderId}/status`, {
      userId,
      status: 'awaiting_shipment',
    });

    await Promise.all([
      loadOrders('awaiting_shipment'),
      refreshPendingCount(),
    ]);
    closePaymentModal();
    return { success: true, message: '支付成功，等待发货' };
  } catch (err) {
    closePaymentModal();
    return {
      success: false,
      message: extractMessage(err, '更新订单状态失败，请稍后再试'),
    };
  }
};

const cancelOrder = async (orderId) => {
  const userId = getUserId();
  if (!userId) {
    return {
      success: false,
      message: '请先登录后再操作订单',
    };
  }

  try {
    await axios.patch(`http://localhost:3000/api/orders/${orderId}/status`, {
      userId,
      status: 'cancelled',
    });

    const targetStatus = lastStatus.value || 'pending_payment';
    await Promise.all([
      loadOrders(targetStatus),
      refreshPendingCount(),
    ]);
    return { success: true, message: '订单已取消' };
  } catch (err) {
    return {
      success: false,
      message: extractMessage(err, '取消订单失败，请稍后再试'),
    };
  }
};

export const ordersStore = {
  orders: readonly(ordersList),
  loading: readonly(loading),
  error: readonly(error),
  statusOptions: readonly(statusOptions),
  statusLabelMap,
  lastStatus: readonly(lastStatus),
  pendingCount: readonly(pendingCount),
  paymentModalState: readonly(paymentModalState),
  ensureStatusOptions,
  loadOrders,
  submitOrder,
  refreshPendingCount,
  openPaymentModal,
  closePaymentModal,
  setPaymentChannel,
  confirmPaymentStatus,
  cancelOrder,
};
