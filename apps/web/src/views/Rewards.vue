<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuth, api } from '../store';

const store = useAuth();
const rewards = ref<any[]>([]);
const studentCode = ref('');
const proofFile = ref<File | null>(null);
const message = ref('');

async function loadRewards() {
  rewards.value = (await api(store.token).get('/api/rewards')).data;
}
onMounted(loadRewards);

async function onFile(e: Event) {
  const t = e.target as HTMLInputElement;
  proofFile.value = t.files?.[0] || null;
}

async function uploadProof(file: File) {
  const contentType = file.type || 'image/jpeg';
  const { data } = await api(store.token).get('/upload/sign', { params: { type: 'reward', contentType } });
  await fetch(data.url, { method: 'PUT', headers: { 'Content-Type': contentType }, body: file });
  return data.publicUrl as string;
}

async function redeem(name: string) {
  let proofUrl = '';
  if (proofFile.value) proofUrl = await uploadProof(proofFile.value);
  const { data } = await api(store.token).post('/api/redeem', {
    studentCode: studentCode.value,
    rewardName: name,
    proofUrl
  });
  message.value = `Redeemed. New balance: ${data.balance}`;
}
</script>

<template>
  <div style="padding: 16px; max-width: 900px; margin: 0 auto;">
    <h2>Rewards Store</h2>
    <input placeholder="Student code" v-model="studentCode" />
    <input type="file" accept="image/*" @change="onFile" />
    <div style="display:grid; gap:12px; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); margin-top:12px;">
      <div v-for="r in rewards" :key="r.id" style="border:1px solid #ddd; padding:12px;">
        <img v-if="r.photoUrl" :src="r.photoUrl" style="width:100%; height:140px; object-fit:cover;" />
        <h4>{{ r.name }}</h4>
        <p>Cost: {{ r.cost }} | Stock: {{ r.inventory }}</p>
        <button :disabled="r.inventory<=0" @click="redeem(r.name)">Redeem</button>
      </div>
    </div>
    <p style="margin-top: 12px;">{{ message }}</p>
  </div>
</template>