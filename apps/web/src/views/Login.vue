<script setup lang="ts">
import { ref } from 'vue';
import { useAuth, api } from '../store';

const email = ref('');
const password = ref('');
const name = ref('');
const orgName = ref('');
const orgSlug = ref('');

const store = useAuth();

async function register() {
  const { data } = await api().post('/auth/register', {
    name: name.value || 'Owner',
    email: email.value,
    password: password.value,
    orgName: orgName.value || 'Home Org',
    orgSlug: orgSlug.value || 'home-org'
  });
  store.setAuth(data.token, data.orgId);
}

async function login() {
  const { data } = await api().post('/auth/login', {
    email: email.value,
    password: password.value
  });
  store.setAuth(data.token, data.orgId);
}
</script>

<template>
  <div style="max-width: 480px; margin: 32px auto; display:grid; gap:8px;">
    <h2>Login / Register</h2>
    <input placeholder="Email" v-model="email" />
    <input placeholder="Password" type="password" v-model="password" />
    <details>
      <summary>Register new org</summary>
      <input placeholder="Your Name" v-model="name" />
      <input placeholder="Org Name" v-model="orgName" />
      <input placeholder="Org Slug" v-model="orgSlug" />
      <button @click="register">Register</button>
    </details>
    <button @click="login">Login</button>
  </div>
</template>