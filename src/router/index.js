import { createWebHistory, createRouter } from 'vue-router'
import RegistrationForm from '../pages/RegistrationForm.vue'
import User from '../pages/User.vue'

const routes = [
  {
    path: '/',
    component: RegistrationForm
  },
  {
    path: '/user/:id',
    name: 'user',
    component: User
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router;