<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuth, api } from '../store';

const store = useAuth();
const studentCode = ref('');
const chores = ref<any[]>([]);
const choreName = ref('');
const photoFile = ref<File | null>(null);
const message = ref('');
const submitting = ref(false);

async function loadChores() {
  chores.value = (await api(store.token).get('/api/chores')).data;
}
onMounted(loadChores);

function onFile(e: Event) {
  const target = e.target as HTMLInputElement;
  photoFile.value = target.files?.[0] || null;
}

async function uploadToGCS(file: File) {
  const contentType = file.type || 'image/jpeg';
  const { data } = await api(store.token).get('/upload/sign', {
    params: { type: 'chore', contentType }
  });
  if (!data?.url) throw new Error('No signed URL');
  // If using a dev stub URL, skip PUT
  if (!String(data.url).startsWith('http://localhost-dev-upload')) {
    await fetch(data.url, {
      method: 'PUT',
      headers: { 'Content-Type': contentType },
      body: file
    });
  }
  return data.publicUrl as string;
}

async function submitChore() {
  submitting.value = true;
  try {
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
    // reset
    choreName.value = '';
    photoFile.value = null;
  } catch (e: any) {
    message.value = e?.response?.data?.error || 'Failed to submit chore';
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <section class="card card--pad" style="max-width: 640px; margin: 0 auto;">
    <div class="stack">
      <h2 class="h2">Chore Submission</h2>
      <div>
        <label class="label">Student code</label>
        <input class="input" placeholder="ALEX01" v-model="studentCode" />
      </div>

      <div>
        <label class="label">Chore</label>
        <select class="select" v-model="choreName">
          <option disabled value="">Select chore</option>
          <option v-for="c in chores" :key="c.id" :value="c.name">
            {{ c.name }} (+{{ c.defaultPoints }})
          </option>
        </select>
      </div>

      <div>
        <label class="label">Photo (optional)</label>
        <input class="input" type="file" accept="image/*" @change="onFile" />
      </div>

      <button class="btn btn--secondary" :disabled="submitting" @click="submitChore">
        {{ submitting ? 'Submitting...' : 'Submit' }}
      </button>

      <p class="mt-2" :class="{'text-muted': !message}">
        {{ message }}
      </p>
    </div>
  </section>
</template>