<template>
  <div class="address-view">
    <TopNavigation />
    <main class="address-main">
      <section class="address-header">
        <div>
          <h1>收货地址管理</h1>
          <p>维护常用收货地址，设为默认后提交订单会自动带入。</p>
        </div>
        <button
          v-if="isLoggedIn"
          type="button"
          class="address-header__button"
          @click="openCreateForm"
        >
          新增地址
        </button>
      </section>

      <div v-if="!isLoggedIn" class="address-status">
        <p>请先登录后再管理收货地址。</p>
        <RouterLink to="/login" class="address-status__link">前往登录</RouterLink>
      </div>

      <div v-else>
        <div v-if="loading" class="address-status">正在加载地址...</div>
        <div v-else-if="loadError" class="address-status address-status--error">
          {{ loadError }}
        </div>
        <div v-else-if="addresses.length === 0" class="address-empty">
          <p>还没有添加任何收货地址。</p>
          <button type="button" class="address-empty__button" @click="openCreateForm">
            立即添加
          </button>
        </div>
        <ul v-else class="address-list">
          <li
            v-for="address in addresses"
            :key="address.id"
            class="address-card"
            :class="{ 'address-card--default': address.isDefault }"
          >
            <header class="address-card__header">
              <div>
                <h2 class="address-card__name">{{ address.recipientName }}</h2>
                <p class="address-card__phone">{{ maskPhone(address.phone) }}</p>
              </div>
              <span v-if="address.isDefault" class="address-card__badge">默认地址</span>
            </header>
            <p class="address-card__region">
              {{ address.province }} {{ address.city }} {{ address.district }}
            </p>
            <p class="address-card__detail">{{ address.detailAddress }}</p>
            <footer class="address-card__footer">
              <button type="button" class="address-card__action" @click="openEditForm(address)">
                编辑
              </button>
              <button
                v-if="!address.isDefault"
                type="button"
                class="address-card__action"
                @click="setDefault(address)"
              >
                设为默认
              </button>
              <button
                type="button"
                class="address-card__action address-card__action--danger"
                @click="removeAddress(address)"
              >
                删除
              </button>
            </footer>
          </li>
        </ul>
      </div>
    </main>

    <transition name="overlay">
      <div v-if="showForm" class="address-dialog__overlay">
        <section class="address-dialog">
          <header class="address-dialog__header">
            <h2>{{ isEditing ? '编辑地址' : '新增地址' }}</h2>
            <button type="button" class="address-dialog__close" @click="closeForm">×</button>
          </header>
          <form class="address-form" @submit.prevent="submitForm">
            <div class="address-form__grid">
              <label class="address-form__field">
                <span>收货人姓名</span>
                <input v-model.trim="formState.recipientName" type="text" placeholder="请输入收货人姓名" required />
              </label>
              <label class="address-form__field">
                <span>手机号</span>
                <input
                  v-model.trim="formState.phone"
                  type="tel"
                  placeholder="请输入手机号"
                  required
                />
              </label>
              <label class="address-form__field">
                <span>省份</span>
                <select v-model="formState.province" required>
                  <option value="" disabled>请选择省份</option>
                  <option v-for="province in provinceOptions" :key="province" :value="province">
                    {{ province }}
                  </option>
                </select>
              </label>
              <label class="address-form__field">
                <span>城市</span>
                <select v-model="formState.city" required>
                  <option value="" disabled>请选择城市</option>
                  <option v-for="city in cityOptions" :key="city" :value="city">
                    {{ city }}
                  </option>
                </select>
              </label>
              <label class="address-form__field">
                <span>区 / 县</span>
                <select v-model="formState.district" required>
                  <option value="" disabled>请选择区 / 县</option>
                  <option v-for="district in districtOptions" :key="district" :value="district">
                    {{ district }}
                  </option>
                </select>
              </label>
              <label class="address-form__field address-form__field--full">
                <span>详细地址</span>
                <input
                  v-model.trim="formState.detailAddress"
                  type="text"
                  placeholder="请输入街道、门牌等详细信息"
                  required
                />
              </label>
            </div>

            <label class="address-form__checkbox">
              <input v-model="formState.isDefault" type="checkbox" />
              <span>设为默认地址</span>
            </label>

            <p v-if="formError" class="address-form__error">{{ formError }}</p>

            <footer class="address-form__footer">
              <button type="button" class="address-form__button address-form__button--ghost" @click="closeForm">
                取消
              </button>
              <button type="submit" class="address-form__button address-form__button--primary" :disabled="submitting">
                {{ submitting ? '提交中...' : '保存地址' }}
              </button>
            </footer>
          </form>
        </section>
      </div>
    </transition>
  </div>
</template>

<script setup>
import {
  computed,
  onMounted,
  reactive,
  ref,
  watch,
} from 'vue';
import axios from 'axios';
import { RouterLink } from 'vue-router';
import TopNavigation from '@/components/TopNavigation.vue';
import { auth } from '@/store/auth';

const authStore = auth;
const currentUser = computed(() => authStore.user.value);
const isLoggedIn = computed(() => Boolean(authStore.token.value && currentUser.value));

const addresses = ref([]);
const loading = ref(false);
const loadError = ref('');

const showForm = ref(false);
const isEditing = ref(false);
const submitting = ref(false);
const formError = ref('');
const editingAddressId = ref(null);

const regions = [
  {
    name: '北京市',
    cities: [
      {
        name: '北京市',
        districts: ['朝阳区', '海淀区', '东城区', '西城区', '丰台区', '顺义区'],
      },
    ],
  },
  {
    name: '上海市',
    cities: [
      {
        name: '上海市',
        districts: ['浦东新区', '徐汇区', '黄浦区', '静安区', '长宁区', '闵行区'],
      },
    ],
  },
  {
    name: '广东省',
    cities: [
      { name: '广州市', districts: ['天河区', '越秀区', '海珠区', '白云区', '番禺区'] },
      { name: '深圳市', districts: ['南山区', '福田区', '罗湖区', '宝安区', '龙岗区'] },
      { name: '佛山市', districts: ['禅城区', '南海区', '顺德区', '三水区'] },
    ],
  },
  {
    name: '浙江省',
    cities: [
      { name: '杭州市', districts: ['西湖区', '上城区', '江干区', '滨江区', '萧山区'] },
      { name: '宁波市', districts: ['海曙区', '鄞州区', '江北区', '北仑区'] },
    ],
  },
  {
    name: '四川省',
    cities: [
      { name: '成都市', districts: ['锦江区', '青羊区', '武侯区', '成华区', '高新区'] },
      { name: '绵阳市', districts: ['涪城区', '游仙区', '安州区'] },
    ],
  },
];

const provinceOptions = computed(() => regions.map((item) => item.name));
const cityOptions = ref([]);
const districtOptions = ref([]);

const formState = reactive({
  recipientName: '',
  phone: '',
  province: '',
  city: '',
  district: '',
  detailAddress: '',
  isDefault: false,
});

const findProvince = (provinceName) =>
  regions.find((item) => item.name === provinceName) || null;

const findCity = (provinceName, cityName) => {
  const province = findProvince(provinceName);
  if (!province) return null;
  return province.cities.find((item) => item.name === cityName) || null;
};

watch(
  () => formState.province,
  (province) => {
    const provinceItem = findProvince(province);
    cityOptions.value = provinceItem ? provinceItem.cities.map((item) => item.name) : [];

    if (!cityOptions.value.includes(formState.city)) {
      formState.city = cityOptions.value[0] || '';
    }
  },
);

watch(
  () => formState.city,
  (city) => {
    const cityItem = findCity(formState.province, city);
    districtOptions.value = cityItem ? cityItem.districts : [];

    if (!districtOptions.value.includes(formState.district)) {
      formState.district = districtOptions.value[0] || '';
    }
  },
);

const maskPhone = (phone) => {
  if (!phone || typeof phone !== 'string') {
    return '—';
  }
  if (phone.length < 7) {
    return `${phone.slice(0, 3)}****`;
  }
  return `${phone.slice(0, 3)}****${phone.slice(-4)}`;
};

const resetForm = () => {
  formState.recipientName = '';
  formState.phone = '';
  formState.province = provinceOptions.value[0] || '';
  formState.city = '';
  formState.district = '';
  formState.detailAddress = '';
  formState.isDefault = addresses.value.length === 0;
  editingAddressId.value = null;
  isEditing.value = false;
  formError.value = '';
};

const hydrateLocationSelections = (address) => {
  if (!address) return;
  formState.province = address.province;
  formState.city = address.city;
  formState.district = address.district;
};

const openCreateForm = () => {
  resetForm();
  showForm.value = true;
};

const openEditForm = (address) => {
  resetForm();
  isEditing.value = true;
  editingAddressId.value = address.id;
  formState.recipientName = address.recipientName;
  formState.phone = address.phone;
  formState.detailAddress = address.detailAddress;
  formState.isDefault = address.isDefault;
  hydrateLocationSelections(address);
  // Ensure watchers populate dependent options
  if (!cityOptions.value.length) {
    const provinceItem = findProvince(address.province);
    cityOptions.value = provinceItem ? provinceItem.cities.map((item) => item.name) : [];
  }
  if (!districtOptions.value.length) {
    const cityItem = findCity(address.province, address.city);
    districtOptions.value = cityItem ? cityItem.districts : [];
  }
  showForm.value = true;
};

const closeForm = () => {
  showForm.value = false;
  formError.value = '';
  submitting.value = false;
};

const validateForm = () => {
  if (!formState.recipientName.trim()) {
    formError.value = '请填写收货人姓名';
    return false;
  }
  const phonePattern = /^1\d{10}$/;
  if (!phonePattern.test(formState.phone)) {
    formError.value = '手机号格式不正确，请输入以 1 开头的 11 位手机号';
    return false;
  }
  if (!formState.province) {
    formError.value = '请选择省份';
    return false;
  }
  if (!formState.city) {
    formError.value = '请选择城市';
    return false;
  }
  if (!formState.district) {
    formError.value = '请选择区 / 县';
    return false;
  }
  if (!formState.detailAddress.trim()) {
    formError.value = '请填写详细地址';
    return false;
  }
  formError.value = '';
  return true;
};

const loadAddresses = async () => {
  if (!currentUser.value) return;
  loading.value = true;
  loadError.value = '';

  try {
    const { data } = await axios.get(
      `http://localhost:3000/api/address/user/${currentUser.value.id}`,
    );
    addresses.value = Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('加载地址失败:', error);
    loadError.value = '加载地址失败，请稍后再试。';
    addresses.value = [];
  } finally {
    loading.value = false;
  }
};

const submitForm = async () => {
  if (!currentUser.value || submitting.value) return;
  if (!validateForm()) {
    return;
  }

  submitting.value = true;
  const payload = {
    userId: currentUser.value.id,
    recipientName: formState.recipientName.trim(),
    phone: formState.phone.trim(),
    province: formState.province,
    city: formState.city,
    district: formState.district,
    detailAddress: formState.detailAddress.trim(),
    isDefault: formState.isDefault,
  };

  try {
    if (isEditing.value && editingAddressId.value) {
      const updatePayload = { ...payload };
      delete updatePayload.userId;
      await axios.patch(
        `http://localhost:3000/api/address/${editingAddressId.value}`,
        updatePayload,
      );
    } else {
      await axios.post('http://localhost:3000/api/address', payload);
    }
    await loadAddresses();
    closeForm();
  } catch (error) {
    console.error('保存地址失败:', error);
    formError.value = '保存地址失败，请检查信息后重试。';
  } finally {
    submitting.value = false;
  }
};

const setDefault = async (address) => {
  try {
    await axios.patch(`http://localhost:3000/api/address/${address.id}`, {
      isDefault: true,
    });
    await loadAddresses();
  } catch (error) {
    console.error('设置默认地址失败:', error);
    window.alert('设置默认地址失败，请稍后重试。');
  }
};

const removeAddress = async (address) => {
  const confirmDelete = window.confirm('确定删除该地址吗？');
  if (!confirmDelete) return;

  try {
    await axios.delete(`http://localhost:3000/api/address/${address.id}`);
    await loadAddresses();
  } catch (error) {
    console.error('删除地址失败:', error);
    window.alert('删除地址失败，请稍后重试。');
  }
};

onMounted(() => {
  if (isLoggedIn.value) {
    loadAddresses();
  }
});

watch(isLoggedIn, (loggedIn) => {
  if (loggedIn) {
    loadAddresses();
  } else {
    addresses.value = [];
  }
});
</script>

<style scoped>
.address-view {
  min-height: 100vh;
  background: #f5f7fb;
  display: flex;
  flex-direction: column;
}

.address-main {
  max-width: 960px;
  width: 100%;
  margin: 0 auto;
  padding: 32px 16px 80px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.address-header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.address-header h1 {
  margin: 0;
  font-size: 2rem;
  color: #2703a6;
}

.address-header p {
  margin: 8px 0 0;
  color: #4b5563;
}

.address-header__button {
  padding: 10px 24px;
  border-radius: 999px;
  border: none;
  background: linear-gradient(90deg, #2703a6, #6c2cf5);
  color: #fff;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.address-header__button:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 24px rgba(39, 3, 166, 0.25);
}

.address-status {
  padding: 24px;
  border-radius: 16px;
  background: #fff;
  text-align: center;
  color: #2703a6;
  border: 1px solid rgba(39, 3, 166, 0.12);
  box-shadow: 0 16px 40px rgba(39, 3, 166, 0.08);
}

.address-status--error {
  color: #d93025;
}

.address-status__link {
  display: inline-block;
  margin-top: 12px;
  padding: 8px 18px;
  border-radius: 999px;
  border: 1px solid #2703a6;
  color: #2703a6;
  text-decoration: none;
  font-weight: 600;
}

.address-empty {
  padding: 32px;
  border-radius: 20px;
  background: #fff;
  text-align: center;
  color: #4b5563;
  border: 1px dashed rgba(39, 3, 166, 0.2);
}

.address-empty__button {
  margin-top: 16px;
  padding: 10px 24px;
  border-radius: 999px;
  border: 1px solid #2703a6;
  background: #fff;
  color: #2703a6;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.address-empty__button:hover {
  background: rgba(39, 3, 166, 0.06);
}

.address-list {
  display: grid;
  gap: 20px;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  padding: 0;
  margin: 0;
  list-style: none;
}

.address-card {
  background: #fff;
  border-radius: 20px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-shadow: 0 18px 40px rgba(39, 3, 166, 0.12);
  border: 1px solid rgba(39, 3, 166, 0.1);
}

.address-card--default {
  border-color: rgba(39, 3, 166, 0.4);
  box-shadow: 0 22px 45px rgba(39, 3, 166, 0.18);
}

.address-card__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.address-card__name {
  margin: 0;
  font-size: 1.2rem;
  color: #1f1f1f;
}

.address-card__phone {
  margin: 4px 0 0;
  color: rgba(39, 3, 166, 0.8);
  font-weight: 600;
}

.address-card__badge {
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(39, 3, 166, 0.12);
  color: #2703a6;
  font-size: 0.85rem;
  font-weight: 600;
}

.address-card__region {
  margin: 0;
  color: #4b5563;
  font-weight: 600;
}

.address-card__detail {
  margin: 0;
  color: #4b5563;
}

.address-card__footer {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 8px;
}

.address-card__action {
  padding: 8px 16px;
  border-radius: 999px;
  border: 1px solid rgba(39, 3, 166, 0.35);
  background: transparent;
  color: #2703a6;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.address-card__action:hover {
  background: rgba(39, 3, 166, 0.08);
}

.address-card__action--danger {
  color: #d93025;
  border-color: rgba(217, 48, 37, 0.4);
}

.address-card__action--danger:hover {
  background: rgba(217, 48, 37, 0.08);
}

.address-dialog__overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  backdrop-filter: blur(4px);
}

.address-dialog {
  width: min(560px, 92vw);
  max-height: 85vh;
  overflow: auto;
  background: #fff;
  border-radius: 24px;
  padding: 24px;
  box-shadow: 0 28px 60px rgba(39, 3, 166, 0.2);
  border: 1px solid rgba(39, 3, 166, 0.16);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.address-dialog__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.address-dialog__header h2 {
  margin: 0;
  color: #2703a6;
}

.address-dialog__close {
  border: none;
  background: none;
  font-size: 24px;
  cursor: pointer;
  color: rgba(15, 23, 42, 0.6);
  transition: transform 0.2s ease;
}

.address-dialog__close:hover {
  transform: scale(1.1);
}

.address-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.address-form__grid {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
}

.address-form__field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  color: #4b5563;
  font-weight: 600;
}

.address-form__field span {
  font-size: 0.92rem;
}

.address-form__field input,
.address-form__field select {
  border-radius: 12px;
  border: 1px solid rgba(39, 3, 166, 0.16);
  padding: 10px 12px;
  font-size: 0.95rem;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.address-form__field input:focus,
.address-form__field select:focus {
  border-color: rgba(39, 3, 166, 0.55);
  box-shadow: 0 0 0 2px rgba(39, 3, 166, 0.12);
}

.address-form__field--full {
  grid-column: 1 / -1;
}

.address-form__checkbox {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
  color: #4b5563;
}

.address-form__checkbox input {
  width: 18px;
  height: 18px;
}

.address-form__error {
  color: #d93025;
  font-weight: 600;
}

.address-form__footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.address-form__button {
  padding: 10px 22px;
  border-radius: 999px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.address-form__button--primary {
  background: linear-gradient(90deg, #2703a6, #6c2cf5);
  color: #fff;
}

.address-form__button--primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 16px 32px rgba(39, 3, 166, 0.25);
}

.address-form__button--primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.address-form__button--ghost {
  background: rgba(39, 3, 166, 0.08);
  color: #2703a6;
}

.address-form__button--ghost:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 28px rgba(39, 3, 166, 0.18);
}

.overlay-enter-active,
.overlay-leave-active {
  transition: opacity 0.2s ease;
}

.overlay-enter-from,
.overlay-leave-to {
  opacity: 0;
}

@media (max-width: 640px) {
  .address-card__footer {
    flex-direction: column;
    align-items: stretch;
  }

  .address-form__footer {
    flex-direction: column-reverse;
  }

  .address-form__footer button {
    width: 100%;
  }
}
</style>
