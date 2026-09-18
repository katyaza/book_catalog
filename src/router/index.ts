import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),

  routes: [
    {
      path: '/',
      redirect: '/books',
    },
    {
      path: '/books',
      component: () => import('../views/BooksView.vue'),
    },
    {
      path: '/books/new',
      component: () => import('../views/BookFormView.vue'),
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/books/:id/edit',
      component: () => import('../views/BookFormView.vue'),
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/books/:id',
      component: () => import('../views/BookView.vue'),
    },
    {
      path: '/authors',
      component: () => import('../views/AuthorsView.vue'),
    },
    {
      path: '/authors/:id',
      component: () => import('../views/AuthorView.vue'),
    },
    {
      path: '/login',
      component: () => import('../views/LoginView.vue'),
    },
    {
      path: '/report',
      component: () => import('../views/ReportView.vue'),
    },
  ],
})

router.beforeEach((to) => {
  if (to.meta.requiresAuth && !localStorage.getItem('token')) {
    return {
      path: '/login',
      query: {
        redirect: to.fullPath,
      },
    }
  }
})

export default router