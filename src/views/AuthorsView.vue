<script setup lang="ts">
import { onMounted, ref } from 'vue'

import apiClient from '../api/client'
import type {
  AuthorListResponse,
  AuthorShort,
} from '../types/api'

const authors = ref<AuthorShort[]>([])
const search = ref('')
const page = ref(1)
const totalPages = ref(1)
const loading = ref(false)
const error = ref('')

const loadAuthors = async () => {
  loading.value = true
  error.value = ''

  try {
    const { data } = await apiClient.get<AuthorListResponse>(
      '/authors',
      {
        params: {
          page: page.value,
          'per-page': 20,
          search: search.value.trim() || undefined,
        },
      },
    )

    authors.value = data.items
    totalPages.value = data.pagination.total_pages
  } catch {
    error.value = 'Не удалось загрузить авторов'
  } finally {
    loading.value = false
  }
}

const searchAuthors = () => {
  page.value = 1
  loadAuthors()
}

const previousPage = () => {
  if (page.value === 1) return

  page.value--
  loadAuthors()
}

const nextPage = () => {
  if (page.value === totalPages.value) return

  page.value++
  loadAuthors()
}

onMounted(loadAuthors)
</script>

<template>
  <section class="authors-page">
    <div class="authors-page__header">
      <h1>Авторы</h1>

      <div class="authors-page__search">
        <input
          v-model="search"
          type="search"
          placeholder="Найти автора"
          @keyup.enter="searchAuthors"
        >

        <button
          type="button"
          @click="searchAuthors"
        >
          Найти
        </button>
      </div>
    </div>

    <div
      v-if="loading"
      class="authors-page__state"
    >
      Загрузка...
    </div>

    <div
      v-else-if="error"
      class="authors-page__state authors-page__state--error"
    >
      {{ error }}
    </div>

    <div
      v-else-if="!authors.length"
      class="authors-page__state"
    >
      Авторы не найдены
    </div>

    <div
      v-else
      class="authors-page__list"
    >
      <RouterLink
        v-for="author in authors"
        :key="author.id"
        :to="`/authors/${author.id}`"
        class="authors-page__card"
      >
        {{ author.full_name }}
      </RouterLink>
    </div>

    <div
      v-if="!loading && !error && totalPages > 1"
      class="authors-page__pagination"
    >
      <button
        type="button"
        :disabled="page === 1"
        @click="previousPage"
      >
        Назад
      </button>

      <span>{{ page }} / {{ totalPages }}</span>

      <button
        type="button"
        :disabled="page === totalPages"
        @click="nextPage"
      >
        Далее
      </button>
    </div>
  </section>
</template>

<style scoped lang="less">
.authors-page {
  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    margin-bottom: 28px;

    h1 {
      margin: 0;
      font-size: 32px;
    }
  }

  &__search {
    display: flex;
    gap: 8px;
    width: 380px;

    input {
      width: 100%;
      height: 42px;
      padding: 0 12px;
      border: 1px solid #dfe2e6;
      border-radius: 8px;
      outline: none;
      background: #fff;

      &:focus {
        border-color: #8b9098;
      }
    }

    button {
      height: 42px;
      padding: 0 16px;
      border: 0;
      border-radius: 8px;
      background: #202124;
      color: #fff;

      &:hover {
        background: #000;
      }
    }
  }

  &__list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 16px;
  }

  &__card {
    padding: 20px;
    border: 1px solid #e7e9ec;
    border-radius: 10px;
    background: #fff;
    color: #202124;
    text-decoration: none;

    &:hover {
      border-color: #c8cbd0;
    }
  }

  &__state {
    padding: 60px 20px;
    color: #6b7078;
    text-align: center;

    &--error {
      color: #c62828;
    }
  }

  &__pagination {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
    margin-top: 32px;

    button {
      min-width: 80px;
      height: 38px;
      border: 1px solid #dfe2e6;
      border-radius: 8px;
      background: #fff;

      &:hover:not(:disabled) {
        background: #f1f2f4;
      }
    }
  }
}

@media (max-width: 600px) {
  .authors-page {
    &__header {
      align-items: flex-start;
      flex-direction: column;
    }

    &__search {
      width: 100%;
    }

    &__list {
      grid-template-columns: 1fr;
    }
  }
}
</style>
