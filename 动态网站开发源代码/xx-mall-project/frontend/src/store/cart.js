import axios from 'axios';
import {
  computed,
  readonly,
  ref,
  watch,
} from 'vue';
import { auth } from './auth';

const items = ref([]);
const loading = ref(false);
const error = ref('');
const initialized = ref(false);

const authStore = auth;

const getUserId = () => authStore.user.value?.id ?? null;

const resetState = () => {
  items.value = [];
  error.value = '';
  initialized.value = false;
};

watch(
  () => authStore.user.value?.id,
  () => {
    resetState();
  },
);

const extractMessage = (err, fallback) => {
  if (err?.response?.data?.message) {
    return err.response.data.message;
  }
  if (err?.message) {
    return err.message;
  }
  return fallback;
};

const loadCart = async (force = false) => {
  const userId = getUserId();
  if (!userId) {
    items.value = [];
    initialized.value = true;
    return;
  }

  if (loading.value) {
    return;
  }

  if (initialized.value && !force) {
    return;
  }

  loading.value = true;
  error.value = '';

  try {
    const { data } = await axios.get(
      `http://localhost:3000/api/cart/user/${userId}`,
    );
    items.value = Array.isArray(data) ? data : [];
  } catch (err) {
    error.value = extractMessage(err, '加载购物车失败，请稍后再试');
    items.value = [];
  } finally {
    loading.value = false;
    initialized.value = true;
  }
};

const addToCart = async (goodsId, quantity = 1) => {
  const userId = getUserId();
  if (!userId) {
    return {
      success: false,
      message: '请先登录后再添加到购物车',
    };
  }

  try {
    await axios.post('http://localhost:3000/api/cart', {
      userId,
      goodsId,
      quantity,
    });
    await loadCart(true);
    return { success: true, message: '已加入购物车' };
  } catch (err) {
    return {
      success: false,
      message: extractMessage(err, '加入购物车失败，请稍后再试'),
    };
  }
};

const updateItemQuantity = async (itemId, quantity) => {
  const userId = getUserId();
  if (!userId) {
    return {
      success: false,
      message: '请先登录后再操作购物车',
    };
  }

  try {
    await axios.patch(`http://localhost:3000/api/cart/${itemId}`, {
      userId,
      quantity,
    });
    await loadCart(true);
    return { success: true, message: '已更新商品数量' };
  } catch (err) {
    return {
      success: false,
      message: extractMessage(err, '更新商品数量失败，请稍后再试'),
    };
  }
};

const removeItem = async (itemId) => {
  const userId = getUserId();
  if (!userId) {
    return {
      success: false,
      message: '请先登录后再操作购物车',
    };
  }

  try {
    await axios.delete(`http://localhost:3000/api/cart/${itemId}`, {
      params: { userId },
    });
    await loadCart(true);
    return { success: true, message: '已移除商品' };
  } catch (err) {
    return {
      success: false,
      message: extractMessage(err, '移除商品失败，请稍后再试'),
    };
  }
};

const clearCart = async () => {
  const userId = getUserId();
  if (!userId) {
    return {
      success: false,
      message: '请先登录后再操作购物车',
    };
  }

  try {
    await axios.delete(`http://localhost:3000/api/cart/user/${userId}`);
    await loadCart(true);
    return { success: true, message: '购物车已清空' };
  } catch (err) {
    return {
      success: false,
      message: extractMessage(err, '清空购物车失败，请稍后再试'),
    };
  }
};

const totalItems = computed(() =>
  items.value.reduce((sum, item) => sum + (item.quantity || 0), 0),
);

const totalAmount = computed(() =>
  items.value.reduce((sum, item) => {
    const price = Number(item?.goods?.price ?? 0);
    const quantity = Number(item?.quantity ?? 0);
    return sum + price * quantity;
  }, 0),
);

export const cart = {
  items: readonly(items),
  loading: readonly(loading),
  error: readonly(error),
  initialized: readonly(initialized),
  loadCart,
  addToCart,
  updateItemQuantity,
  removeItem,
  clearCart,
  totalItems: readonly(totalItems),
  totalAmount: readonly(totalAmount),
};

