<script setup lang="ts">
import { useRouter } from 'vue-router'

import { useAuthStore } from './stores/auth'

const auth = useAuthStore()
const router = useRouter()

const logout = () => {
  auth.logout()
  router.push('/books')
}
</script>

<template>
  <header class="app-header">
    <div class="app-header__inner container">
      <RouterLink
        to="/books"
        class="app-header__logo"
      >
        Book<span>Store</span>
      </RouterLink>

      <nav class="app-header__nav">
        <RouterLink to="/books">
          Книги
        </RouterLink>

        <RouterLink to="/authors">
          Авторы
        </RouterLink>

        <RouterLink to="/report">
          Отчёт
        </RouterLink>
      </nav>

      <div class="app-header__auth">
        <template v-if="auth.isAuthenticated">
          <span class="app-header__user">
            {{ auth.user?.username }}
          </span>

          <button
            type="button"
            @click="logout"
          >
            Выйти
          </button>
        </template>

        <RouterLink
          v-else
          to="/login"
        >
          Войти
        </RouterLink>
      </div>
    </div>
  </header>

  <main class="app-content container">
    <RouterView />
  </main>
</template>

<style scoped lang="less">
.app-header {
  position: sticky;
  top: 0;
  z-index: 10;
  border-bottom: 1px solid #e6e8eb;
  background: #fff;

  &__inner {
    display: flex;
    align-items: center;
    min-height: 68px;
    gap: 32px;
  }

  &__logo {
    flex-shrink: 0;
    color: #202124;
    font-size: 20px;
    font-weight: 700;
    text-decoration: none;

    span {
      color: #6b7078;
    }
  }

  &__nav {
    display: flex;
    gap: 24px;

    a {
      color: #6b7078;
      font-size: 14px;
      text-decoration: none;

      &:hover,
      &.router-link-active {
        color: #202124;
      }

      &.router-link-active {
        font-weight: 600;
      }
    }
  }

  &__auth {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-left: auto;

    a,
    button {
      color: #202124;
      font-size: 14px;
    }

    button {
      padding: 0;
      border: 0;
      background: none;

      &:hover {
        text-decoration: underline;
      }
    }
  }

  &__user {
    color: #6b7078;
    font-size: 14px;
  }
}

.app-content {
  padding-top: 40px;
  padding-bottom: 60px;
}

@media (max-width: 700px) {
  .app-header {
    &__inner {
      flex-wrap: wrap;
      gap: 16px;
      padding-top: 14px;
      padding-bottom: 14px;
    }

    &__nav {
      order: 3;
      width: 100%;
      justify-content: space-between;
    }

    &__user {
      display: none;
    }
  }

  .app-content {
    padding-top: 28px;
  }
}
</style>
