<template>
  <div class="auth-container">
    <h1 class="auth-title">登录</h1>
    <form class="auth-form" @submit.prevent="handleLogin">
      <label class="auth-label" for="username">用户名</label>
      <input
        id="username"
        v-model="form.username"
        type="text"
        placeholder="请输入用户名"
        class="auth-input"
        autocomplete="username"
      />

      <label class="auth-label" for="password">密码</label>
      <input
        id="password"
        v-model="form.password"
        type="password"
        placeholder="请输入密码"
        class="auth-input"
        autocomplete="current-password"
      />

      <p v-if="errorMessage" class="auth-error">{{ errorMessage }}</p>

      <button type="submit" class="auth-button" :disabled="submitting">
        {{ submitting ? '登录中...' : '登录' }}
      </button>
    </form>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { auth } from '@/store/auth';

const router = useRouter();

const form = reactive({
  username: '',
  password: '',
});

const submitting = ref(false);
const errorMessage = ref('');

const handleLogin = async () => {
  if (!form.username || !form.password) {
    errorMessage.value = '请输入用户名和密码';
    return;
  }

  submitting.value = true;
  errorMessage.value = '';

  try {
    const { data } = await axios.post('http://localhost:3000/api/auth/login', {
      username: form.username,
      password: form.password,
    });

    if (data?.access_token) {
      auth.login(data.access_token, data.user || null);
      await router.push('/');
    } else {
      errorMessage.value = '登录响应异常，请稍后再试';
    }
  } catch (error) {
    errorMessage.value = error?.response?.data?.message || '登录失败，请检查用户名或密码';
  } finally {
    submitting.value = false;
  }
};
</script>

<style scoped>
.auth-container {
  max-width: 360px;
  margin: 80px auto;
  padding: 32px;
  border-radius: 12px;
  border: 1px solid rgba(39, 3, 166, 0.15);
  background: #fff;
  box-shadow: 0 12px 32px rgba(39, 3, 166, 0.1);
}

.auth-title {
  margin-bottom: 24px;
  text-align: center;
  color: #2703a6;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.auth-label {
  font-weight: 600;
  color: #1f2937;
}

.auth-input {
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid rgba(39, 3, 166, 0.3);
  font-size: 14px;
}

.auth-input:focus {
  outline: none;
  border-color: #2703a6;
  box-shadow: 0 0 0 2px rgba(39, 3, 166, 0.2);
}

.auth-error {
  color: #dc2626;
  font-size: 13px;
}

.auth-button {
  margin-top: 8px;
  padding: 12px;
  border: none;
  border-radius: 999px;
  background: linear-gradient(90deg, #2703a6, #6c2cf5);
  color: #fff;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.auth-button:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.auth-button:not(:disabled):hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 24px rgba(39, 3, 166, 0.25);
}
</style>
