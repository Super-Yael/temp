<template>
  <nav class="top-navigation">
    <div class="top-navigation__links">
      <RouterLink to="/" class="top-navigation__link">
        首页
      </RouterLink>
      <RouterLink
        v-for="category in categories"
        :key="category.id"
        :to="`/category/${category.id}`"
        class="top-navigation__link"
      >
        {{ category.name || '未命名分类' }}
      </RouterLink>
    </div>
    <div class="top-navigation__auth">
      <template v-if="!isLoggedIn">
        <RouterLink to="/login" class="top-navigation__auth-link">登录</RouterLink>
        <RouterLink to="/register" class="top-navigation__auth-link top-navigation__auth-link--primary">
          注册
        </RouterLink>
      </template>
      <template v-else>
        <div ref="userMenuRef" class="top-navigation__menu">
          <button
            type="button"
            class="top-navigation__avatar-button"
            aria-haspopup="true"
            :aria-expanded="showDropdown ? 'true' : 'false'"
            @click="toggleDropdown"
          >
            <img
              v-if="hasAvatar"
              :src="avatarUrl"
              alt="用户头像"
              class="top-navigation__avatar-image"
              loading="lazy"
              decoding="async"
            />
            <span v-else class="top-navigation__avatar-placeholder" aria-hidden="true">+</span>
          </button>

          <transition name="fade">
            <div v-if="showDropdown" class="top-navigation__dropdown" role="menu">
              <div class="top-navigation__dropdown-header">
                <div class="top-navigation__dropdown-avatar">
                  <img
                    v-if="hasAvatar"
                    :src="avatarUrl"
                    alt="用户头像"
                    class="top-navigation__dropdown-avatar-image"
                    loading="lazy"
                    decoding="async"
                  />
                  <span v-else class="top-navigation__dropdown-placeholder" aria-hidden="true">+</span>
                </div>
                <div class="top-navigation__dropdown-meta">
                  <p class="top-navigation__dropdown-name">{{ displayName }}</p>
                  <p class="top-navigation__dropdown-email">{{ displayEmail }}</p>
                </div>
              </div>
              <RouterLink
                to="/address"
                class="top-navigation__dropdown-item"
                role="menuitem"
                @click="closeDropdown"
              >
                地址管理
              </RouterLink>
              <RouterLink
                to="/profile"
                class="top-navigation__dropdown-item"
                role="menuitem"
                @click="closeDropdown"
              >
                个人中心
              </RouterLink>
              <button
                type="button"
                class="top-navigation__dropdown-item top-navigation__dropdown-item--danger"
                role="menuitem"
                @click="handleLogout"
              >
                退出登录
              </button>
            </div>
          </transition>
        </div>
      </template>
    </div>
  </nav>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import axios from 'axios';
import { RouterLink } from 'vue-router';
import { auth } from '@/store/auth';

const categories = ref([]);
const authStore = auth;
const isLoggedIn = computed(() => Boolean(authStore.token.value && authStore.user.value));
const currentUser = computed(() => authStore.user.value);

const avatarUrl = computed(() => {
  const avatar = currentUser.value?.avatar || currentUser.value?.avatarUrl || currentUser.value?.avatar_url;
  if (!avatar) {
    return '';
  }
  if (/^https?:\/\//i.test(avatar)) {
    return avatar;
  }
  const normalized = avatar.startsWith('/') ? avatar.slice(1) : avatar;
  return `/${normalized}`;
});

const hasAvatar = computed(() => Boolean(avatarUrl.value));

const displayName = computed(() => {
  return currentUser.value?.name || currentUser.value?.username || '尊敬的用户';
});

const maskEmail = (email) => {
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return '未填写邮箱';
  }

  const [local, domain] = email.split('@');
  if (!local || !domain) {
    return '未填写邮箱';
  }

  const maskedLocal =
    local.length > 3 ? `${local.slice(0, local.length - 3)}***` : '*'.repeat(local.length || 3);

  const maskedDomain =
    domain.length > 3 ? `***${domain.slice(3)}` : `${'*'.repeat(domain.length || 3)}`;

  return `${maskedLocal}@${maskedDomain}`;
};

const displayEmail = computed(() => maskEmail(currentUser.value?.email));

const showDropdown = ref(false);
const userMenuRef = ref(null);

const handleDocumentClick = (event) => {
  if (!showDropdown.value) {
    return;
  }

  const menuEl = userMenuRef.value;
  if (menuEl && !menuEl.contains(event.target)) {
    showDropdown.value = false;
  }
};

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value;
};

const closeDropdown = () => {
  showDropdown.value = false;
};

const handleLogout = () => {
  authStore.logout();
  closeDropdown();
};

onMounted(async () => {
  try {
    const { data } = await axios.get('http://localhost:3000/api/type');
    categories.value = Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Failed to load categories:', error);
    categories.value = [];
  }

  document.addEventListener('click', handleDocumentClick);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleDocumentClick);
});
</script>

<style scoped>
.top-navigation {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
  padding: 16px 24px;
  background-color: #f7f9ff;
  border-bottom: 1px solid rgba(39, 3, 166, 0.12);
}

.top-navigation__links {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  flex: 1 1 auto;
}

.top-navigation__link {
  color: #2703a6;
  text-decoration: none;
  font-weight: 600;
  padding: 8px 16px;
  border-radius: 999px;
  border: 1px solid rgba(39, 3, 166, 0.3);
  transition: all 0.2s ease;
}

.top-navigation__link:hover {
  background-color: #2703a6;
  color: #fff;
  box-shadow: 0 6px 20px rgba(39, 3, 166, 0.25);
}

.top-navigation__auth {
  display: flex;
  align-items: center;
  gap: 12px;
}

.top-navigation__auth-link {
  text-decoration: none;
  font-weight: 600;
  padding: 8px 16px;
  border-radius: 999px;
  color: #2703a6;
  border: 1px solid rgba(39, 3, 166, 0.3);
  transition: all 0.2s ease;
}

.top-navigation__auth-link:hover {
  background-color: rgba(39, 3, 166, 0.08);
}

.top-navigation__auth-link--primary {
  background-color: #2703a6;
  color: #fff;
  border-color: #2703a6;
}

.top-navigation__auth-link--primary:hover {
  box-shadow: 0 6px 20px rgba(39, 3, 166, 0.25);
}

.top-navigation__user {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #2703a6;
}

.top-navigation__menu {
  position: relative;
  display: flex;
  align-items: center;
}

.top-navigation__avatar-button {
  border: none;
  padding: 0;
  margin: 0;
  background: linear-gradient(135deg, rgba(39, 3, 166, 0.1), rgba(108, 44, 245, 0.15));
  width: 42px;
  height: 42px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.top-navigation__avatar-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 24px rgba(39, 3, 166, 0.2);
}

.top-navigation__avatar-image {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.top-navigation__avatar-placeholder {
  font-size: 24px;
  line-height: 1;
  font-weight: 700;
  color: #2703a6;
}

.top-navigation__dropdown {
  position: absolute;
  top: calc(100% + 12px);
  right: 0;
  min-width: 200px;
  padding: 12px;
  border-radius: 16px;
  background: #ffffff;
  box-shadow: 0 20px 45px rgba(39, 3, 166, 0.18);
  border: 1px solid rgba(39, 3, 166, 0.12);
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 1000;
}

.top-navigation__dropdown-header {
  display: flex;
  gap: 12px;
  align-items: center;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(39, 3, 166, 0.12);
}

.top-navigation__dropdown-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(39, 3, 166, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.top-navigation__dropdown-avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.top-navigation__dropdown-placeholder {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  font-size: 28px;
  font-weight: 700;
  color: #2703a6;
}

.top-navigation__dropdown-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.top-navigation__dropdown-name {
  margin: 0;
  font-weight: 600;
  color: #1f1f1f;
}

.top-navigation__dropdown-email {
  margin: 0;
  font-size: 0.85rem;
  color: rgba(39, 3, 166, 0.7);
}

.top-navigation__dropdown-item {
  width: 100%;
  border: none;
  background: none;
  text-decoration: none;
  color: #2703a6;
  font-weight: 600;
  font-size: 0.95rem;
  font-family: inherit;
  line-height: 1.4;
  padding: 10px;
  border-radius: 12px;
  text-align: left;
  transition: background-color 0.2s ease, color 0.2s ease;
  cursor: pointer;
}

.top-navigation__dropdown-item:hover {
  background: rgba(39, 3, 166, 0.08);
}

.top-navigation__dropdown-item--danger {
  color: #d93025;
}

.top-navigation__dropdown-item--danger:hover {
  background: rgba(217, 48, 37, 0.08);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.18s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.top-navigation__user-link {
  color: #2703a6;
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: border-color 0.2s ease;
}

.top-navigation__user-link:hover {
  border-color: #2703a6;
}

@media (max-width: 768px) {
  .top-navigation {
    flex-direction: column;
    align-items: flex-start;
  }

  .top-navigation__links {
    justify-content: center;
  }

  .top-navigation__auth {
    width: 100%;
    justify-content: center;
  }
}
</style>
