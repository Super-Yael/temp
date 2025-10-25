<template>
  <div class="profile-page">
    <TopNavigation />
    <div class="profile-container">
      <div v-if="isLoggedIn">
        <h1 class="profile-title">个人中心</h1>

        <section class="profile-avatar-card">
          <div class="profile-avatar" @click="triggerFileSelect">
            <img
              v-if="avatarPreview"
              :src="avatarPreview"
              alt="用户头像预览"
              class="profile-avatar__image"
            />
            <span v-else class="profile-avatar__placeholder">+</span>
            <input
              ref="fileInput"
              class="profile-avatar__input"
              type="file"
              accept="image/*"
              @change="handleFileChange"
            />
          </div>
          <div class="profile-avatar__actions">
            <button type="button" class="profile-avatar__button" @click="triggerFileSelect">
              选择图片
            </button>
            <button
              type="button"
              class="profile-avatar__button profile-avatar__button--primary"
              :disabled="!selectedAvatar || uploading"
              @click="handleUpload"
            >
              {{ uploading ? '上传中...' : '保存头像' }}
            </button>
            <button
              v-if="currentUser?.avatar"
              type="button"
              class="profile-avatar__button profile-avatar__button--ghost"
              :disabled="uploading"
              @click="handleRemoveAvatar"
            >
              移除头像
            </button>
          </div>
          <p v-if="avatarMessage" class="profile-avatar__message" :class="`profile-avatar__message--${avatarMessage.type}`">
            {{ avatarMessage.text }}
          </p>
          <p class="profile-avatar__hint">支持 JPG、PNG、GIF，大小不超过 2MB。</p>
        </section>

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
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue';
import { useRouter, RouterLink } from 'vue-router';
import { auth } from '@/store/auth';
import TopNavigation from '@/components/TopNavigation.vue';
import axios from 'axios';

const authStore = auth;
const router = useRouter();
const currentUser = computed(() => authStore.user.value);
const isLoggedIn = computed(() => Boolean(authStore.token.value && currentUser.value));

const avatarState = reactive({
  selected: null,
  message: '',
  messageType: 'info',
});

const uploading = ref(false);
const fileInput = ref(null);

const avatarPreview = computed(() => {
  if (avatarState.selected) {
    return avatarState.selected;
  }
  return currentUser.value?.avatar || '';
});

const avatarMessage = computed(() => {
  if (!avatarState.message) {
    return null;
  }
  return { type: avatarState.messageType, text: avatarState.message };
});

const selectedAvatar = computed(() => avatarState.selected);

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

const triggerFileSelect = () => {
  fileInput.value?.click();
};

const resetMessage = () => {
  avatarState.message = '';
  avatarState.messageType = 'info';
};

const setMessage = (type, text) => {
  avatarState.messageType = type;
  avatarState.message = text;
};

const handleFileChange = (event) => {
  resetMessage();
  const file = event.target.files ? event.target.files[0] : null;
  if (!file) {
    return;
  }

  if (!file.type.startsWith('image/')) {
    setMessage('error', '仅支持上传图片文件');
    avatarState.selected = null;
    return;
  }

  const maxSize = 2 * 1024 * 1024;
  if (file.size > maxSize) {
    setMessage('error', '图片大小不能超过 2MB');
    avatarState.selected = null;
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    avatarState.selected = String(reader.result);
    setMessage('info', '预览已更新，请点击保存头像');
  };
  reader.onerror = () => {
    setMessage('error', '读取文件失败，请重试');
    avatarState.selected = null;
  };

  reader.readAsDataURL(file);
};

const handleUpload = async () => {
  resetMessage();
  if (!currentUser.value) {
    setMessage('error', '账号信息缺失，请重新登录');
    return;
  }

  if (!avatarState.selected) {
    setMessage('error', '请先选择一张图片');
    return;
  }

  uploading.value = true;
  try {
    const { data } = await axios.patch(
      `http://localhost:3000/api/user/${currentUser.value.id}/avatar`,
      { avatar: avatarState.selected },
    );

    authStore.updateUser(data);
    avatarState.selected = null;
    if (fileInput.value) {
      fileInput.value.value = '';
    }
    setMessage('success', '头像已更新');
  } catch (error) {
    setMessage('error', error.response?.data?.message || '上传失败，请稍后再试');
  } finally {
    uploading.value = false;
  }
};

const handleRemoveAvatar = async () => {
  resetMessage();
  if (!currentUser.value) {
    setMessage('error', '账号信息缺失，请重新登录');
    return;
  }

  uploading.value = true;
  try {
    const { data } = await axios.patch(
      `http://localhost:3000/api/user/${currentUser.value.id}/avatar`,
      { avatar: null },
    );

    authStore.updateUser(data);
    avatarState.selected = null;
    if (fileInput.value) {
      fileInput.value.value = '';
    }
    setMessage('success', '头像已移除');
  } catch (error) {
    setMessage('error', error.response?.data?.message || '操作失败，请稍后再试');
  } finally {
    uploading.value = false;
  }
};
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background: #f5f7fb;
  display: flex;
  flex-direction: column;
}

.profile-container {
  flex: 1;
  max-width: 560px;
  width: 100%;
  margin: 40px auto 80px;
  padding: 0 24px 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.profile-title {
  text-align: center;
  color: #2703a6;
}

.profile-avatar-card {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  border: 1px solid rgba(39, 3, 166, 0.16);
  box-shadow: 0 12px 28px rgba(39, 3, 166, 0.12);
  align-items: center;
}

.profile-avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: rgba(39, 3, 166, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  cursor: pointer;
  overflow: hidden;
  transition: box-shadow 0.2s ease, transform 0.2s ease;
}

.profile-avatar:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 24px rgba(39, 3, 166, 0.18);
}

.profile-avatar__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-avatar__placeholder {
  font-size: 40px;
  font-weight: 700;
  color: rgba(39, 3, 166, 0.8);
}

.profile-avatar__input {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
}

.profile-avatar__actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
}

.profile-avatar__button {
  padding: 8px 18px;
  border-radius: 999px;
  border: 1px solid rgba(39, 3, 166, 0.3);
  background: transparent;
  color: #2703a6;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}

.profile-avatar__button:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 24px rgba(39, 3, 166, 0.12);
  background: rgba(39, 3, 166, 0.06);
}

.profile-avatar__button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.profile-avatar__button--primary {
  border: none;
  background: linear-gradient(135deg, #2703a6, #6c2cf5);
  color: #fff;
}

.profile-avatar__button--ghost {
  background: transparent;
  border-style: dashed;
}

.profile-avatar__message {
  width: 100%;
  text-align: center;
  font-weight: 600;
  border-radius: 12px;
  padding: 8px 12px;
}

.profile-avatar__message--success {
  background: rgba(60, 180, 75, 0.12);
  color: #2a7a38;
}

.profile-avatar__message--error {
  background: rgba(217, 48, 37, 0.12);
  color: #b52119;
}

.profile-avatar__message--info {
  background: rgba(39, 3, 166, 0.08);
  color: #2703a6;
}

.profile-avatar__hint {
  margin: 0;
  color: rgba(39, 3, 166, 0.65);
  font-size: 0.85rem;
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
