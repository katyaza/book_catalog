<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'

import apiClient from '../api/client'
import { useAuthStore } from '../stores/auth'
import type {
  AuthorListResponse,
  AuthorShort,
  Book,
  BookListResponse,
} from '../types/api'

const auth = useAuthStore()

const books = ref<Book[]>([])
const authors = ref<AuthorShort[]>([])

const search = ref('')
const year = ref('')
const authorId = ref('')

const page = ref(1)
const totalPages = ref(1)

const loading = ref(false)
const loadingAuthors = ref(false)
const error = ref('')

const years = Array.from(
  { length: new Date().getFullYear() - 1700 },
  (_, i) => new Date().getFullYear() - i,
)

const loadBooks = async () => {
  loading.value = true
  error.value = ''

  try {
    const { data } = await apiClient.get<BookListResponse>(
      '/books',
      {
        params: {
          page: page.value,
          'per-page': 12,
          search: search.value.trim() || undefined,
          year: year.value || undefined,
          author_id: authorId.value || undefined,
        },
      },
    )

    books.value = data.items
    totalPages.value = data.pagination.total_pages
  } catch {
    error.value = 'Не удалось загрузить книги'
  } finally {
    loading.value = false
  }
}

const loadAuthors = async () => {
  loadingAuthors.value = true

  try {
    const { data } = await apiClient.get<AuthorListResponse>(
      '/authors',
      {
        params: {
          page: 1,
          'per-page': 100,
        },
      },
    )

    authors.value = data.items
  } catch {
    authors.value = []
  } finally {
    loadingAuthors.value = false
  }
}

const resetPage = () => {
  if (page.value === 1) {
    loadBooks()
  } else {
    page.value = 1
  }
}

const previousPage = () => {
  if (page.value > 1) {
    page.value--
  }
}

const nextPage = () => {
  if (page.value < totalPages.value) {
    page.value++
  }
}

let searchTimer: ReturnType<typeof setTimeout>

watch(search, () => {
  clearTimeout(searchTimer)

  searchTimer = setTimeout(() => {
    resetPage()
  }, 300)
})

watch([year, authorId], resetPage)
watch(page, loadBooks)

onMounted(() => {
  loadBooks()
  loadAuthors()
})
</script>

<template>
  <section class="books-page">
    <header class="books-page__header page-header">
      <h1>Каталог книг</h1>

      <RouterLink
        v-if="auth.isAuthenticated"
        to="/books/new"
        class="button"
      >
        Добавить книгу
      </RouterLink>
    </header>

    <div class="books-page__filters">
      <input
        v-model="search"
        type="search"
        placeholder="Поиск по названию"
      >

      <select v-model="year">
        <option value="">
          Все годы
        </option>

        <option
          v-for="item in years"
          :key="item"
          :value="String(item)"
        >
          {{ item }}
        </option>
      </select>

      <select
        v-model="authorId"
        :disabled="loadingAuthors"
      >
        <option value="">
          Все авторы
        </option>

        <option
          v-for="author in authors"
          :key="author.id"
          :value="String(author.id)"
        >
          {{ author.full_name }}
        </option>
      </select>
    </div>

    <div
      v-if="loading"
      class="books-page__state"
    >
      Загрузка...
    </div>

    <div
      v-else-if="error"
      class="books-page__state books-page__state--error"
    >
      {{ error }}
    </div>

    <div
      v-else-if="!books.length"
      class="books-page__state"
    >
      Книги не найдены
    </div>

    <div
      v-else
      class="books-page__list"
    >
      <article
        v-for="book in books"
        :key="book.id"
        class="book-card"
      >
        <RouterLink
          :to="`/books/${book.id}`"
          class="book-card__link"
        >
          <img
            v-if="book.cover_url"
            :src="book.cover_url"
            :alt="book.title"
            class="book-card__cover"
          >

          <div
            v-else
            class="book-card__cover book-card__cover--empty"
          >
            Нет обложки
          </div>

          <div class="book-card__content">
            <h2 class="book-card__title">
              {{ book.title }}
            </h2>

            <p class="book-card__year">
              {{ book.year }}
            </p>

            <div
              v-if="book.authors.length"
              class="book-card__authors"
            >
              <span
                v-for="author in book.authors"
                :key="author.id"
                class="book-card__author"
              >
                {{ author.full_name }}
              </span>
            </div>
          </div>
        </RouterLink>
      </article>
    </div>

    <div
      v-if="!loading && !error && totalPages > 1"
      class="books-page__pagination"
    >
      <button
        type="button"
        :disabled="page === 1"
        @click="previousPage"
      >
        ←
      </button>

      <span>{{ page }} из {{ totalPages }}</span>

      <button
        type="button"
        :disabled="page === totalPages"
        @click="nextPage"
      >
        →
      </button>
    </div>
  </section>
</template>

<style scoped lang="less">
.books-page {
  &__header {
    margin-bottom: 28px;
  }

  &__filters {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr;
    gap: 12px;
    margin-bottom: 28px;

    input,
    select {
      width: 100%;
      height: 44px;
      padding: 0 14px;
      border: 1px solid #dfe2e6;
      border-radius: 8px;
      outline: none;
      background: #fff;

      &:focus {
        border-color: #8b9098;
      }

      &:disabled {
        background: #f1f2f4;
      }
    }
  }

  &__list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 20px;
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
      width: 38px;
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

.book-card {
  overflow: hidden;
  border: 1px solid #e7e9ec;
  border-radius: 12px;
  background: #fff;

  &:hover {
    border-color: #c8cbd0;
  }

  &__link {
    display: block;
    height: 100%;
    color: inherit;
    text-decoration: none;
  }

  &__cover {
    display: block;
    width: 100%;
    aspect-ratio: 3 / 4;
    object-fit: cover;
    background: #eef0f2;

    &--empty {
      display: flex;
      align-items: center;
      justify-content: center;
      color: #8a8f97;
    }
  }

  &__content {
    padding: 16px;
  }

  &__title {
    margin: 0 0 6px;
    font-size: 18px;
    line-height: 1.3;
  }

  &__year {
    margin: 0 0 12px;
    color: #7a7f87;
    font-size: 14px;
  }

  &__authors {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  &__author {
    padding: 4px 8px;
    border-radius: 6px;
    background: #f1f2f4;
    color: #5d626a;
    font-size: 12px;
  }
}

@media (max-width: 600px) {
  .books-page {
    &__filters {
      grid-template-columns: 1fr;
    }

    &__list {
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
    }
  }

  .book-card {
    &__content {
      padding: 12px;
    }

    &__title {
      font-size: 16px;
    }
  }
}
</style>
