<script setup lang="ts">
import { onMounted, ref } from 'vue'

import apiClient from '../api/client'
import type {
  TopAuthor,
  TopAuthorsResponse,
} from '../types/api'

const currentYear = new Date().getFullYear()

const year = ref(currentYear)
const authors = ref<TopAuthor[]>([])
const loading = ref(false)
const error = ref('')

const loadReport = async () => {
  loading.value = true
  error.value = ''

  try {
    const { data } = await apiClient.get<TopAuthorsResponse>(
      '/reports/top-authors',
      {
        params: {
          year: year.value,
        },
      },
    )

    authors.value = data.items
  } catch {
    error.value = 'Не удалось загрузить отчёт'
  } finally {
    loading.value = false
  }
}

onMounted(loadReport)
</script>

<template>
  <section class="report-page">
    <header class="report-page__header page-header">
      <h1>ТОП-10 авторов</h1>

      <form
        class="report-page__controls"
        @submit.prevent="loadReport"
      >
        <input
          v-model.number="year"
          type="number"
          min="1"
          :max="currentYear"
          aria-label="Год"
        >

        <button
          type="submit"
          :disabled="loading"
        >
          {{ loading ? 'Загрузка...' : 'Показать' }}
        </button>
      </form>
    </header>

    <div
      v-if="error"
      class="report-page__error error"
    >
      {{ error }}
    </div>

    <div
      v-else-if="loading"
      class="report-page__state"
    >
      Загрузка...
    </div>

    <div
      v-else-if="!authors?.length"
      class="report-page__state"
    >
      За {{ year }} год данных нет
    </div>

    <div
      v-else
      class="report-page__table"
    >
      <table>
        <thead>
          <tr>
            <th>№</th>
            <th>Автор</th>
            <th>Книг</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="author in authors"
            :key="author.author_id"
          >
            <td>{{ author.rank }}</td>
            <td>
              <RouterLink :to="`/authors/${author.author_id}`">
                {{ author.full_name }}
              </RouterLink>
            </td>
            <td>{{ author.books_count }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<style scoped lang="less">
.report-page {
  &__controls {
    display: flex;
    gap: 8px;

    input {
      width: 110px;
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
      font: inherit;

      &:hover:not(:disabled) {
        background: #000;
      }
    }
  }

  &__table {
    width: 100%;
    overflow-x: auto;
    border: 1px solid #e7e9ec;
    border-radius: 10px;
    background: #fff;

    table {
      width: 100%;
      border-collapse: collapse;
    }

    th,
    td {
      padding: 14px 18px;
      border-bottom: 1px solid #eef0f2;
      text-align: left;
    }

    th {
      color: #6b7078;
      font-size: 13px;
      font-weight: 600;
    }

    td:first-child {
      width: 60px;
      color: #7a7f87;
    }

    td a {
      color: #202124;
      font-weight: 500;
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }

    tr:last-child td {
      border-bottom: 0;
    }
  }

  &__state {
    padding: 60px 20px;
    color: #6b7078;
    text-align: center;
  }

  &__error {
    margin-bottom: 20px;
  }
}

@media (max-width: 600px) {
  .report-page {
    &__header {
      align-items: flex-start;
    }

    &__controls {
      width: 100%;

      input {
        flex: 1;
        width: auto;
      }
    }

    &__table {
      th,
      td {
        padding: 12px;
      }
    }
  }
}
</style>
