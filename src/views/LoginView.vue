<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const username = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

const login = async () => {
  if (!username.value || !password.value) {
    error.value = 'Введите логин и пароль'
    return
  }

  loading.value = true
  error.value = ''

  try {
    await auth.login(username.value, password.value)

    const redirect = String(route.query.redirect || '/books')
    router.push(redirect)
  } catch {
    error.value = 'Неверный логин или пароль'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section class="login-page">
    <form
      class="login-form"
      @submit.prevent="login"
    >
      <h1>Вход</h1>

      <p
        v-if="error"
        class="login-form__error error"
      >
        {{ error }}
      </p>

      <label class="login-form__field">
        <span>Логин</span>

        <input
          v-model="username"
          type="text"
          autocomplete="username"
          placeholder="Введите логин"
        >
      </label>

      <label class="login-form__field">
        <span>Пароль</span>

        <input
          v-model="password"
          type="password"
          autocomplete="current-password"
          placeholder="Введите пароль"
        >
      </label>

      <button
        type="submit"
        class="login-form__button"
        :disabled="loading"
      >
        {{ loading ? 'Вход...' : 'Войти' }}
      </button>
    </form>
  </section>
</template>

<style scoped lang="less">
.login-page {
  display: flex;
  justify-content: center;
  padding: 40px 0;
}

.login-form {
  width: min(100%, 400px);
  padding: 28px;
  border: 1px solid #e7e9ec;
  border-radius: 12px;
  background: #fff;

  h1 {
    margin: 0 0 24px;
    font-size: 28px;
  }

  &__error {
    margin-bottom: 20px;
  }

  &__field {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 16px;
    color: #4f545c;
    font-size: 14px;
    font-weight: 500;

    input {
      width: 100%;
      height: 44px;
      padding: 0 12px;
      border: 1px solid #dfe2e6;
      border-radius: 8px;
      outline: none;

      &:focus {
        border-color: #8b9098;
      }
    }
  }

  &__button {
    width: 100%;
    height: 44px;
    margin-top: 4px;
    border: 0;
    border-radius: 8px;
    background: #202124;
    color: #fff;
    font: inherit;

    &:hover:not(:disabled) {
      background: #000;
    }
  }
}
</style>
