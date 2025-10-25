<template>
  <div class="auth-container">
    <h1 class="auth-title">注册</h1>
    <form class="auth-form" @submit.prevent="handleRegister">
      <label class="auth-label" for="username">用户名</label>
      <input
        id="username"
        v-model="form.username"
        type="text"
        placeholder="请输入用户名"
        class="auth-input"
        autocomplete="username"
      />

      <label class="auth-label" for="email">Email</label>
      <input
        id="email"
        v-model="form.email"
        type="email"
        placeholder="请输入邮箱"
        class="auth-input"
        autocomplete="email"
      />

      <label class="auth-label" for="password">密码</label>
      <input
        id="password"
        v-model="form.password"
        type="password"
        placeholder="请输入密码"
        class="auth-input"
        autocomplete="new-password"
      />

      <p v-if="successMessage" class="auth-success">{{ successMessage }}</p>
      <p v-if="errorMessage" class="auth-error">{{ errorMessage }}</p>

      <button type="submit" class="auth-button" :disabled="submitting">
        {{ submitting ? '注册中...' : '注册' }}
      </button>
    </form>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const router = useRouter();

const form = reactive({
  username: '',
  email: '',
  password: '',
});

const submitting = ref(false);
const errorMessage = ref('');
const successMessage = ref('');

const handleRegister = async () => {
  if (!form.username || !form.email || !form.password) {
    errorMessage.value = '请完整填写注册信息';
    successMessage.value = '';
    return;
  }

  submitting.value = true;
  errorMessage.value = '';
  successMessage.value = '';

  try {
    await axios.post('http://localhost:3000/api/auth/register', {
      username: form.username,
      email: form.email,
      password: form.password,
    });

    successMessage.value = '注册成功，请前往登录';
    await router.push('/login');
  } catch (error) {
    errorMessage.value = error?.response?.data?.message || '注册失败，请稍后再试';
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

.auth-success {
  color: #059669;
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
