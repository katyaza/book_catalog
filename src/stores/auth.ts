import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import apiClient from '../api/client'
import type { LoginResponse, User } from '../types/api'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token'))

  const storedUser = localStorage.getItem('user')
  const user = ref<User | null>(
    storedUser ? JSON.parse(storedUser) : null,
  )

  const isAuthenticated = computed(() => Boolean(token.value))

  const login = async (username: string, password: string) => {
    const { data } = await apiClient.post<LoginResponse>('/auth/login', {
      username,
      password,
    })

    token.value = data.token
    user.value = data.user

    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
  }

  const logout = () => {
    token.value = null
    user.value = null

    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  return {
    token,
    user,
    isAuthenticated,
    login,
    logout,
  }
})
