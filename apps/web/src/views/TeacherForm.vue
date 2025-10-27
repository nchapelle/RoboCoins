<script setup lang="ts">
import { ref } from 'vue';
import { useAuth, api } from '../store';

const store = useAuth();

const studentCode = ref('');
const raterCode = ref('');
const attention = ref(3);
const obedience = ref(3);
const attitude = ref(3);
const participation = ref(3);
const shout = ref(false);
const notes = ref('');
const result = ref('');
const submitting = ref(false);

async function submitForm() {
  submitting.value = true;
  try {
    const scores = {
      Attention: attention.value,
      Obedience: obedience.value,
      Attitude: attitude.value,
      Participation: participation.value
    };
    const { data } = await api(store.token).post('/api/behavior', {
      studentCode: studentCode.value,
      raterCode: raterCode.value,
      scores,
      shoutOut: shout.value,
      notes: notes.value
    });
    result.value = `Awarded ${data.points} points. New balance: ${data.balance}`;
  } catch (e: any) {
    result.value = e?.response?.data?.error || 'Submission failed';
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <section class="card card--pad" style="max-width: 640px; margin: 0 auto;">
    <div class="stack">
      <h2 class="h2">Teacher Daily Behavior</h2>
      <div>
        <label class="label">Student code</label>
        <input class="input" placeholder="ALEX01" v-model="studentCode" />
      </div>
      <div>
        <label class="label">Rater code</label>
        <input class="input" placeholder="RIV01" v-model="raterCode" />
      </div>

      <div class="stack">
        <div>
          <label class="label">Attention: {{ attention }}</label>
          <input class="input" type="range" min="1" max="5" v-model="attention" />
        </div>
        <div>
          <label class="label">Obedience: {{ obedience }}</label>
          <input class="input" type="range" min="1" max="5" v-model="obedience" />
        </div>
        <div>
          <label class="label">Attitude: {{ attitude }}</label>
          <input class="input" type="range" min="1" max="5" v-model="attitude" />
        </div>
        <div>
          <label class="label">Participation: {{ participation }}</label>
          <input class="input" type="range" min="1" max="5" v-model="participation" />
        </div>
      </div>

      <label class="cluster">
        <input type="checkbox" v-model="shout" />
        <span>Teacher shout‑out (+2)</span>
      </label>

      <div>
        <label class="label">Notes</label>
        <textarea class="textarea" rows="3" placeholder="Optional context..." v-model="notes" />
      </div>

      <button class="btn btn--primary" :disabled="submitting" @click="submitForm">
        {{ submitting ? 'Submitting...' : 'Submit' }}
      </button>

      <p class="mt-2" :class="{'text-muted': !result}">
        {{ result }}
      </p>
    </div>
  </section>
</template>