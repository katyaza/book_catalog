<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import apiClient from '../api/client'
import { useAuthStore } from '../stores/auth'
import type { Book } from '../types/api'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const book = ref<Book | null>(null)
const loading = ref(true)
const deleting = ref(false)
const error = ref('')

const loadBook = async () => {
  try {
    const { data } = await apiClient.get<Book>(
      `/books/${route.params.id}`,
    )

    book.value = data
  } catch {
    error.value = 'Не удалось загрузить книгу'
  } finally {
    loading.value = false
  }
}

const deleteBook = async () => {
  if (!book.value) return

  if (!window.confirm(`Удалить книгу «${book.value.title}»?`)) {
    return
  }

  deleting.value = true
  error.value = ''

  try {
    await apiClient.delete(`/books/${book.value.id}`)
    router.push('/books')
  } catch {
    error.value = 'Не удалось удалить книгу'
  } finally {
    deleting.value = false
  }
}

onMounted(loadBook)
</script>

<template>
  <section class="book-page">
    <button
      type="button"
      class="book-page__back"
      @click="router.push('/books')"
    >
      Назад к каталогу
    </button>

    <div
      v-if="loading"
      class="book-page__state"
    >
      Загрузка...
    </div>

    <div
      v-else-if="error && !book"
      class="book-page__state book-page__state--error"
    >
      {{ error }}
    </div>

    <article
      v-else-if="book"
      class="book-page__content"
    >
      <div class="book-page__cover">
        <img
          v-if="book.cover_url"
          :src="book.cover_url"
          :alt="book.title"
        >

        <span v-else>
          Нет обложки
        </span>
      </div>

      <div class="book-page__info">
        <h1>{{ book.title }}</h1>

        <p class="book-page__year">
          {{ book.year }}
        </p>

        <div
          v-if="book.authors.length"
          class="book-page__block"
        >
          <span class="book-page__label">Авторы</span>

          <div class="book-page__authors">
            <RouterLink
              v-for="author in book.authors"
              :key="author.id"
              :to="`/authors/${author.id}`"
              class="book-page__author"
            >
              {{ author.full_name }}
            </RouterLink>
          </div>
        </div>

        <div
          v-if="book.isbn"
          class="book-page__block"
        >
          <span class="book-page__label">ISBN</span>
          <span>{{ book.isbn }}</span>
        </div>

        <div
          v-if="book.description"
          class="book-page__block book-page__description"
        >
          <span class="book-page__label">Описание</span>
          <p>{{ book.description }}</p>
        </div>

        <p
          v-if="error"
          class="book-page__error error"
        >
          {{ error }}
        </p>

        <div
          v-if="auth.isAuthenticated"
          class="book-page__actions"
        >
          <RouterLink
            :to="`/books/${book.id}/edit`"
            class="book-page__button book-page__button--primary"
          >
            Редактировать
          </RouterLink>

          <button
            type="button"
            class="book-page__button book-page__button--danger"
            :disabled="deleting"
            @click="deleteBook"
          >
            {{ deleting ? 'Удаление...' : 'Удалить' }}
          </button>
        </div>
      </div>
    </article>
  </section>
</template>

<style scoped lang="less">
.book-page {
  &__back {
    margin-bottom: 28px;
    padding: 0;
    border: 0;
    background: none;
    color: #6b7078;
    font-size: 14px;

    &:hover {
      color: #202124;
    }
  }

  &__content {
    display: grid;
    grid-template-columns: 380px 1fr;
    gap: 48px;
  }

  &__cover {
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    aspect-ratio: 3 / 4;
    border-radius: 12px;
    background: #eef0f2;
    color: #8a8f97;

    img {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  &__info {
    padding-top: 8px;

    h1 {
      margin: 0 0 8px;
      font-size: 40px;
      line-height: 1.15;
    }
  }

  &__year {
    margin: 0 0 28px;
    color: #7a7f87;
  }

  &__block {
    margin-bottom: 24px;
  }

  &__label {
    display: block;
    margin-bottom: 8px;
    color: #7a7f87;
    font-size: 13px;
  }

  &__authors {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  &__author {
    padding: 7px 10px;
    border-radius: 6px;
    background: #f1f2f4;
    color: #202124;
    font-size: 14px;
    text-decoration: none;

    &:hover {
      background: #e7e9ec;
    }
  }

  &__description {
    color: #4f545c;
    line-height: 1.6;

    p {
      margin: 0;
    }
  }

  &__error {
    margin-bottom: 20px;
  }

  &__actions {
    display: flex;
    gap: 12px;
    margin-top: 32px;
  }

  &__button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 42px;
    padding: 0 18px;
    border-radius: 8px;
    font: inherit;
    text-decoration: none;

    &--primary {
      border: 0;
      background: #202124;
      color: #fff;

      &:hover {
        background: #000;
      }
    }

    &--danger {
      border: 1px solid #e0b4b4;
      background: #fff;
      color: #c62828;

      &:hover:not(:disabled) {
        background: #fff5f5;
      }
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
}

@media (max-width: 700px) {
  .book-page {
    &__content {
      grid-template-columns: 1fr;
      gap: 28px;
    }

    &__cover {
      max-width: 360px;
    }

    &__info {
      padding-top: 0;

      h1 {
        font-size: 32px;
      }
    }

    &__actions {
      flex-direction: column;
    }

    &__button {
      width: 100%;
    }
  }
}
</style>
