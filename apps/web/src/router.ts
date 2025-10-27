import { createRouter, createWebHistory } from 'vue-router';
import Login from './views/Login.vue';
import Dashboard from './views/Dashboard.vue';
import TeacherForm from './views/TeacherForm.vue';
import ChoreForm from './views/ChoreForm.vue';
import Rewards from './views/Rewards.vue';

export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Dashboard },
    { path: '/login', component: Login },
    { path: '/teacher', component: TeacherForm },
    { path: '/chore', component: ChoreForm },
    { path: '/rewards', component: Rewards }
  ]
});