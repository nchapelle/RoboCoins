<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuth, api } from '../store';

const store = useAuth();
const rewards = ref<any[]>([]);
const studentCode = ref('');
const proofFile = ref<File | null>(null);
const message = ref('');
const redeeming = ref<string | null>(null);

async function loadRewards() {
  rewards.value = (await api(store.token).get('/api/rewards')).data;
}
onMounted(loadRewards);

function onFile(e: Event) {
  const t = e.target as HTMLInputElement;
  proofFile.value = t.files?.[0] || null;
}

async function uploadProof(file: File) {
  const contentType = file.type || 'image/jpeg';
  const { data } = await api(store.token).get('/upload/sign', {
    params: { type: 'reward', contentType }
  });
  if (!data?.url) throw new Error('No signed URL');
  if (!String(data.url).startsWith('http://localhost-dev-upload')) {
    await fetch(data.url, { method: 'PUT', headers: { 'Content-Type': contentType }, body: file });
  }
  return data.publicUrl as string;
}

async function redeem(name: string) {
  try {
    redeeming.value = name;
    let proofUrl = '';
    if (proofFile.value) proofUrl = await uploadProof(proofFile.value);
    const { data } = await api(store.token).post('/api/redeem', {
      studentCode: studentCode.value,
      rewardName: name,
      proofUrl
    });
    message.value = `Redeemed. New balance: ${data.balance}`;
    await loadRewards();
  } catch (e: any) {
    message.value = e?.response?.data?.error || 'Redemption failed';
  } finally {
    redeeming.value = null;
  }
}
</script>

<template>
  <div class="stack">
    <h2 class="h2">Rewards Store</h2>

    <section class="card card--pad" style="max-width: 900px; margin: 0 auto;">
      <div class="stack">
        <div class="cluster" style="gap: var(--space-4);">
          <div style="flex: 1;">
            <label class="label">Student code</label>
            <input class="input" placeholder="ALEX01" v-model="studentCode" />
          </div>
          <div style="flex: 1;">
            <label class="label">Proof photo (optional)</label>
            <input class="input" type="file" accept="image/*" @change="onFile" />
          </div>
        </div>

        <div class="grid mt-4">
          <div v-for="r in rewards" :key="r.id" class="card card--pad">
            <div class="stack">
              <img
                v-if="r.photoUrl"
                :src="r.photoUrl"
                alt=""
                style="width: 100%; height: 160px; object-fit: cover; border-radius: var(--radius-md);"
              />
              <div class="cluster" style="justify-content: space-between;">
                <h3 class="h3" style="margin: 0;">{{ r.name }}</h3>
                <span class="badge">Cost: {{ r.cost }}</span>
              </div>
              <div class="cluster" style="justify-content: space-between;">
                <span class="text-muted">Stock: {{ r.inventory }}</span>
                <button
                  class="btn btn--primary"
                  :disabled="r.inventory <= 0 || !studentCode"
                  @click="redeem(r.name)"
                >
                  {{ redeeming === r.name ? 'Processing...' : r.inventory <= 0 ? 'Out of stock' : 'Redeem' }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <p class="mt-2" :class="{'text-muted': !message}">{{ message }}</p>
      </div>
    </section>
  </div>
</template>