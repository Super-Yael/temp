<template>
  <div class="profile-container">
    <div v-if="isLoggedIn">
      <h1 class="profile-title">个人中心</h1>
     <div class="profile-card">
       <p class="profile-row">
         <span class="label">用户名：</span>
         <span>{{ currentUser?.username || '暂无数据' }}</span>
       </p>
       <p class="profile-row">
         <span class="label">邮箱：</span>
         <span>{{ maskedEmail }}</span>
       </p>
     </div>
      <div class="logout-wrapper">
        <button class="logout-button" @click="handleLogout">
          退出登录
        </button>
      </div>
    </div>
    <div v-else class="profile-empty">
      <h2>您还未登录</h2>
      <RouterLink to="/login" class="profile-link">前往登录</RouterLink>
      <RouterLink to="/register" class="profile-link profile-link--primary">注册新账号</RouterLink>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter, RouterLink } from 'vue-router';
import { auth } from '@/store/auth';

const authStore = auth;
const router = useRouter();
const currentUser = computed(() => authStore.user.value);
const isLoggedIn = computed(() => Boolean(authStore.token.value && currentUser.value));

const maskEmail = (email) => {
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return '暂无数据';
  }

  const [local, domain] = email.split('@');
  if (!local || !domain) {
    return '暂无数据';
  }

  const obfuscateSegment = (segment, hideFromEnd = true) => {
    if (!segment) {
      return '***';
    }

    if (segment.length <= 3) {
      return '*'.repeat(segment.length || 3);
    }

    if (hideFromEnd) {
      return `${segment.slice(0, segment.length - 3)}***`;
    }

    return `***${segment.slice(3)}`;
  };

  const maskedLocal = obfuscateSegment(local, true);
  const maskedDomain = obfuscateSegment(domain, false);

  return `${maskedLocal}@${maskedDomain}`;
};

const maskedEmail = computed(() => maskEmail(currentUser.value?.email));

const handleLogout = () => {
  authStore.logout();
  void router.push('/');
};
</script>

<style scoped>
.profile-container {
  max-width: 560px;
  margin: 80px auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.profile-title {
  text-align: center;
  color: #2703a6;
}

.profile-card {
  padding: 24px;
  border-radius: 16px;
  border: 1px solid rgba(39, 3, 166, 0.16);
  background-color: #fff;
  box-shadow: 0 12px 28px rgba(39, 3, 166, 0.12);
}

.profile-row {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
  font-size: 15px;
  color: #1f2937;
}

.profile-row:last-child {
  margin-bottom: 0;
}

.label {
  font-weight: 600;
  color: #2703a6;
}

.logout-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 16px;
}

.logout-button {
  padding: 12px 32px;
  border: none;
  border-radius: 999px;
  background: linear-gradient(90deg, #2703a6, #6c2cf5);
  color: #fff;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.logout-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 24px rgba(39, 3, 166, 0.25);
}

.profile-empty {
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: center;
  padding: 40px 24px;
  border-radius: 16px;
  border: 1px dashed rgba(39, 3, 166, 0.3);
  background-color: #fff;
}

.profile-link {
  text-decoration: none;
  padding: 10px 24px;
  border-radius: 999px;
  border: 1px solid #2703a6;
  color: #2703a6;
  font-weight: 600;
  transition: all 0.2s ease;
}

.profile-link:hover {
  background-color: rgba(39, 3, 166, 0.08);
}

.profile-link--primary {
  background-color: #2703a6;
  color: #fff;
}

.profile-link--primary:hover {
  box-shadow: 0 6px 20px rgba(39, 3, 166, 0.25);
}
</style>
