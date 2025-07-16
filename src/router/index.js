import { createRouter, createWebHistory } from 'vue-router'
import EventList from '../views/EventList.vue'
import EventForm from '../views/EventForm.vue'

const routes = [
  {
    path: '/',
    name: 'EventList',
    component: EventList
  },
  {
    path: '/create',
    name: 'CreateEvent',
    component: EventForm
  },
  {
    path: '/edit/:id',
    name: 'EditEvent',
    component: EventForm,
    props: true
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router