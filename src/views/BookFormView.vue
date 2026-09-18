<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import apiClient from '../api/client'
import { sendSms } from '../api/sms'
import type { AuthorShort, Book } from '../types/api'

const route = useRoute()
const router = useRouter()

const isEdit = computed(() => Boolean(route.params.id))

const title = ref('')
const year = ref<number | null>(null)
const description = ref('')
const isbn = ref('')
const authorIds = ref<number[]>([])
const cover = ref<File | null>(null)

const authors = ref<AuthorShort[]>([])
const loading = ref(false)
const loadingAuthors = ref(false)
const error = ref('')

const loadAuthors = async () => {
  loadingAuthors.value = true

  try {
    const { data } = await apiClient.get(
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
    error.value = 'Не удалось загрузить авторов'
  } finally {
    loadingAuthors.value = false
  }
}

const loadBook = async () => {
  if (!isEdit.value) return

  try {
    const { data } = await apiClient.get<Book>(
      `/books/${route.params.id}`,
    )

    title.value = data.title
    year.value = data.year
    description.value = data.description || ''
    isbn.value = data.isbn || ''
    authorIds.value = data.authors.map(author => author.id)
  } catch {
    error.value = 'Не удалось загрузить книгу'
  }
}

const handleCoverChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  cover.value = input.files?.[0] || null
}

const sendNotifications = async (bookTitle: string) => {
  const stored = localStorage.getItem('bookstore_subscriptions')

  if (!stored) return

  const subscriptions = JSON.parse(stored) as {
    authorId: number
    phone: string
  }[]

  const phones = [
    ...new Set(
      subscriptions
        .filter(item => authorIds.value.includes(item.authorId))
        .map(item => item.phone),
    ),
  ]

  if (!phones.length) return

  await Promise.allSettled(
    phones.map(phone =>
      sendSms(
        phone,
        `Новая книга «${bookTitle}» добавлена в каталог.`,
      ),
    ),
  )
}

const submit = async () => {
  error.value = ''

  if (
    !title.value.trim() ||
    !year.value ||
    !authorIds.value.length ||
    (!isEdit.value && !cover.value)
  ) {
    error.value = 'Заполните обязательные поля'
    return
  }

  loading.value = true

  try {
    if (isEdit.value) {
      await apiClient.patch(
        `/books/${route.params.id}`,
        {
          title: title.value.trim(),
          year: year.value,
          description: description.value.trim() || null,
          isbn: isbn.value.trim() || null,
          author_ids: authorIds.value,
        },
      )

      router.push(`/books/${route.params.id}`)
      return
    }

    const formData = new FormData()

    formData.append('title', title.value.trim())
    formData.append('year', String(year.value))

    if (description.value.trim()) {
      formData.append('description', description.value.trim())
    }

    if (isbn.value.trim()) {
      formData.append('isbn', isbn.value.trim())
    }

    authorIds.value.forEach(id => {
      formData.append('author_ids[]', String(id))
    })

    if (cover.value) {
      formData.append('cover', cover.value)
    }

    const { data } = await apiClient.post<Book>(
      '/books',
      formData,
    )

    await sendNotifications(data.title)

    router.push(`/books/${data.id}`)
  } catch {
    error.value = isEdit.value
      ? 'Не удалось сохранить изменения'
      : 'Не удалось создать книгу'
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.push(
    isEdit.value
      ? `/books/${route.params.id}`
      : '/books',
  )
}

onMounted(async () => {
  await loadAuthors()
  await loadBook()
})
</script>

<template>
  <section class="book-form">
    <div class="book-form__back">
      <button
        type="button"
        @click="goBack"
      >
        Назад
      </button>
    </div>

    <h1 class="book-form__title">
      {{ isEdit ? 'Редактирование книги' : 'Новая книга' }}
    </h1>

    <p
      v-if="error"
      class="book-form__error error"
    >
      {{ error }}
    </p>

    <form
      class="book-form__form"
      @submit.prevent="submit"
    >
      <label class="book-form__field">
        <span>Название *</span>

        <input
          v-model="title"
          type="text"
          placeholder="Название книги"
        >
      </label>

      <label class="book-form__field">
        <span>Год *</span>

        <input
          v-model.number="year"
          type="number"
          min="1"
          placeholder="2026"
        >
      </label>

      <label class="book-form__field">
        <span>Авторы *</span>

        <select
          v-model="authorIds"
          multiple
          :disabled="loadingAuthors"
        >
          <option
            v-for="author in authors"
            :key="author.id"
            :value="author.id"
          >
            {{ author.full_name }}
          </option>
        </select>

        <small v-if="loadingAuthors">
          Загрузка авторов...
        </small>
      </label>

      <label class="book-form__field">
        <span>ISBN</span>

        <input
          v-model="isbn"
          type="text"
          placeholder="978-..."
        >
      </label>

      <label class="book-form__field">
        <span>Описание</span>

        <textarea
          v-model="description"
          placeholder="Описание книги"
        />
      </label>

      <label
        v-if="!isEdit"
        class="book-form__field"
      >
        <span>Обложка *</span>

        <input
          type="file"
          accept="image/*"
          @change="handleCoverChange"
        >
      </label>

      <div class="book-form__actions">
        <button
          type="button"
          class="book-form__button book-form__button--secondary"
          @click="goBack"
        >
          Отмена
        </button>

        <button
          type="submit"
          class="book-form__button book-form__button--primary"
          :disabled="loading"
        >
          {{ loading
            ? 'Сохранение...'
            : isEdit
              ? 'Сохранить'
              : 'Добавить книгу'
          }}
        </button>
      </div>
    </form>
  </section>
</template>

<style scoped lang="less">
.book-form {
  max-width: 720px;
  margin: 0 auto;

  &__back {
    margin-bottom: 20px;

    button {
      padding: 0;
      border: 0;
      background: none;
      color: #6b7078;
      font-size: 14px;

      &:hover {
        color: #202124;
      }
    }
  }

  &__title {
    margin: 0 0 24px;
    font-size: 36px;
  }

  &__error {
    margin-bottom: 20px;
  }

  &__form {
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding: 28px;
    border: 1px solid #e7e9ec;
    border-radius: 12px;
    background: #fff;
  }

  &__field {
    display: flex;
    flex-direction: column;
    gap: 8px;
    color: #4f545c;
    font-size: 14px;
    font-weight: 500;

    input,
    textarea,
    select {
      width: 100%;
      border: 1px solid #dfe2e6;
      border-radius: 8px;
      outline: none;
      background: #fff;

      &:focus {
        border-color: #8b9098;
      }

      &:disabled {
        background: #f6f7f9;
      }
    }

    input,
    select {
      min-height: 44px;
      padding: 0 12px;
    }

    textarea {
      min-height: 140px;
      padding: 12px;
      resize: vertical;
    }

    input[type='file'] {
      padding: 10px 12px;
    }

    select[multiple] {
      height: 140px;
      padding: 8px;
    }

    small {
      color: #7a7f87;
      font-size: 12px;
      font-weight: 400;
    }
  }

  &__actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 8px;
  }

  &__button {
    min-height: 44px;
    padding: 0 18px;
    border-radius: 8px;
    font: inherit;

    &--primary {
      border: 0;
      background: #202124;
      color: #fff;

      &:hover:not(:disabled) {
        background: #000;
      }
    }

    &--secondary {
      border: 1px solid #dfe2e6;
      background: #fff;
      color: #202124;

      &:hover {
        background: #f6f7f9;
      }
    }
  }
}

@media (max-width: 600px) {
  .book-form {
    &__form {
      padding: 20px;
    }

    &__actions {
      flex-direction: column-reverse;
    }

    &__button {
      width: 100%;
    }
  }
}
</style>
