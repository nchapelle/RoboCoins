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
  <div class="center" style="min-height: calc(100vh - 64px);">
    <div class="card card--pad" style="width: 100%; max-width: 440px;">
      <div class="stack">
        <h2 class="h2">Welcome back</h2>
        <div>
          <label class="label">Email</label>
          <input class="input" v-model="email" placeholder="you@example.com" />
        </div>
        <div>
          <label class="label">Password</label>
          <input class="input" type="password" v-model="password" placeholder="••••••••" />
        </div>
        <div class="cluster" style="justify-content: space-between;">
          <button class="btn btn--primary" @click="login">Sign in</button>
          <details>
            <summary class="badge">Create new org</summary>
            <div class="stack mt-2">
              <input class="input" placeholder="Your name" v-model="name" />
              <input class="input" placeholder="Org name" v-model="orgName" />
              <input class="input" placeholder="Org slug" v-model="orgSlug" />
              <button class="btn btn--secondary" @click="register">Register</button>
            </div>
          </details>
        </div>
      </div>
    </div>
  </div>
</template>