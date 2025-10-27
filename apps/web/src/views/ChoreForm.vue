<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuth, api } from '../store';

const store = useAuth();
const studentCode = ref('');
const chores = ref<any[]>([]);
const choreName = ref('');
const photoFile = ref<File | null>(null);
const message = ref('');

async function loadChores() {
  chores.value = (await api(store.token).get('/api/chores')).data;
}
onMounted(loadChores);

async function onFile(e: Event) {
  const target = e.target as HTMLInputElement;
  photoFile.value = target.files?.[0] || null;
}

async function uploadToGCS(file: File) {
  const contentType = file.type || 'image/jpeg';
  const { data } = await api(store.token).get('/upload/sign', {
    params: { type: 'chore', contentType }
  });
  await fetch(data.url, { method: 'PUT', headers: { 'Content-Type': contentType }, body: file });
  return data.publicUrl as string;
}

async function submitChore() {
  let photoUrl = '';
  if (photoFile.value) {
    photoUrl = await uploadToGCS(photoFile.value);
  }
  const { data } = await api(store.token).post('/api/chore-log', {
    studentCode: studentCode.value,
    choreName: choreName.value,
    photoUrl
  });
  message.value = `Logged +${data.points} points. New balance: ${data.balance}`;
}
</script>

<template>
  <div style="padding: 16px; max-width: 520px; margin: 0 auto; display:grid; gap:12px;">
    <h2>Chore Submission</h2>
    <input placeholder="Student code" v-model="studentCode" />
    <select v-model="choreName">
      <option disabled value="">Select chore</option>
      <option v-for="c in chores" :key="c.id" :value="c.name">{{ c.name }} (+{{ c.defaultPoints }})</option>
    </select>
    <input type="file" accept="image/*" @change="onFile" />
    <button @click="submitChore">Submit</button>
    <p>{{ message }}</p>
  </div>
</template>