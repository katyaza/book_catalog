<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import apiClient from '../api/client'
import type { Author } from '../types/api'

const route = useRoute()
const router = useRouter()

const author = ref<Author | null>(null)
const loading = ref(true)
const error = ref('')

const phone = ref('')
const subscribed = ref(false)

const STORAGE_KEY = 'bookstore_subscriptions'

interface Subscription {
  authorId: number
  phone: string
}

const loadSubscription = () => {
  const stored = localStorage.getItem(STORAGE_KEY)

  if (!stored) return

  const subscriptions: Subscription[] = JSON.parse(stored)
  const subscription = subscriptions.find(
    item => item.authorId === Number(route.params.id),
  )

  if (!subscription) return

  phone.value = subscription.phone
  subscribed.value = true
}

const subscribe = () => {
  if (!phone.value) return

  const stored = localStorage.getItem(STORAGE_KEY)
  const subscriptions: Subscription[] = stored
    ? JSON.parse(stored)
    : []

  const authorId = Number(route.params.id)

  const updated = subscriptions.filter(
    item => item.authorId !== authorId,
  )

  updated.push({
    authorId,
    phone: phone.value,
  })

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  subscribed.value = true
}

const unsubscribe = () => {
  const stored = localStorage.getItem(STORAGE_KEY)

  if (!stored) return

  const subscriptions: Subscription[] = JSON.parse(stored)

  const updated = subscriptions.filter(
    item => item.authorId !== Number(route.params.id),
  )

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))

  subscribed.value = false
  phone.value = ''
}

const loadAuthor = async () => {
  try {
    const { data } = await apiClient.get<Author>(
      `/authors/${route.params.id}`,
    )

    author.value = data
    loadSubscription()
  } catch {
    error.value = 'Не удалось загрузить автора'
  } finally {
    loading.value = false
  }
}

onMounted(loadAuthor)
</script>

<template>
  <section class="author-page">
    <button
      type="button"
      class="author-page__back"
      @click="router.push('/authors')"
    >
      Назад к авторам
    </button>

    <div
      v-if="loading"
      class="author-page__state"
    >
      Загрузка...
    </div>

    <div
      v-else-if="error"
      class="author-page__state author-page__state--error"
    >
      {{ error }}
    </div>

    <template v-else-if="author">
      <div class="author-page__header">
        <h1>{{ author.full_name }}</h1>

        <p class="author-page__count">
          Книг: {{ author.books?.length }}
        </p>
      </div>

      <section class="author-page__subscription">
        <div>
          <h2>Новые книги автора</h2>

          <p>
            Получайте SMS-уведомление о новых книгах.
          </p>
        </div>

        <div
          v-if="!subscribed"
          class="author-page__form"
        >
          <input
            v-model="phone"
            type="tel"
            placeholder="+7 900 000-00-00"
            class="author-page__input"
          >

          <button
            type="button"
            class="button"
            :disabled="!phone"
            @click="subscribe"
          >
            Подписаться
          </button>
        </div>

        <div
          v-else
          class="author-page__subscribed"
        >
          <span>Подписка активна: {{ phone }}</span>

          <button
            type="button"
            class="author-page__unsubscribe"
            @click="unsubscribe"
          >
            Отписаться
          </button>
        </div>
      </section>

      <section class="author-page__books">
        <h2>Книги</h2>

        <div
          v-if="!author.books.length"
          class="author-page__empty"
        >
          У автора пока нет книг
        </div>

        <div
          v-else
          class="author-page__book-list"
        >
          <RouterLink
            v-for="book in author.books"
            :key="book.id"
            :to="`/books/${book.id}`"
            class="author-page__book"
          >
            <span>{{ book.title }}</span>
            <span class="author-page__book-year">
              {{ book.year }}
            </span>
          </RouterLink>
        </div>
      </section>
    </template>
  </section>
</template>

<style scoped lang="less">
.author-page {
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

  &__header {
    margin-bottom: 28px;

    h1 {
      margin: 0;
      font-size: 32px;
    }
  }

  &__count {
    margin: 8px 0 0;
    color: #7a7f87;
  }

  &__subscription {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
    margin-bottom: 48px;
    padding: 24px;
    border: 1px solid #e6e8eb;
    border-radius: 12px;
    background: #fff;

    h2 {
      margin: 0 0 6px;
      font-size: 18px;
    }

    p {
      margin: 0;
      color: #7a7f87;
      font-size: 14px;
    }
  }

  &__form {
    display: flex;
    gap: 10px;
  }

  &__input {
    width: 220px;
    min-height: 42px;
    padding: 0 12px;
    border: 1px solid #dfe2e6;
    border-radius: 8px;
    outline: none;

    &:focus {
      border-color: #202124;
    }
  }

  &__subscribed {
    display: flex;
    align-items: center;
    gap: 16px;
    color: #3f7045;
    font-size: 14px;
  }

  &__unsubscribe {
    padding: 0;
    border: 0;
    background: none;
    color: #c62828;
    font-size: 14px;

    &:hover {
      text-decoration: underline;
    }
  }

  &__books {
    h2 {
      margin: 0 0 20px;
      font-size: 22px;
    }
  }

  &__book-list {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  &__book {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    padding: 18px 20px;
    border: 1px solid #e6e8eb;
    border-radius: 10px;
    background: #fff;
    text-decoration: none;

    &:hover {
      border-color: #bfc3c8;
    }
  }

  &__book-year {
    flex-shrink: 0;
    color: #7a7f87;
  }

  &__empty {
    color: #7a7f87;
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
  .author-page {
    &__subscription {
      align-items: stretch;
      flex-direction: column;
    }

    &__form {
      flex-direction: column;
    }

    &__input {
      width: 100%;
    }

    &__subscribed {
      align-items: flex-start;
      flex-direction: column;
    }

    &__book-list {
      grid-template-columns: 1fr;
    }
  }
}
</style>
