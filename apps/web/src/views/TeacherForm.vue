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

async function submitForm() {
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
}
</script>

<template>
  <div style="padding: 16px; max-width: 520px; margin: 0 auto; display:grid; gap:12px;">
    <h2>Teacher Daily Behavior</h2>
    <input placeholder="Student code (e.g., ALEX01)" v-model="studentCode" />
    <input placeholder="Rater code (e.g., RIV01)" v-model="raterCode" />
    <label>Attention: <input type="range" min="1" max="5" v-model="attention" /></label>
    <label>Obedience: <input type="range" min="1" max="5" v-model="obedience" /></label>
    <label>Attitude: <input type="range" min="1" max="5" v-model="attitude" /></label>
    <label>Participation: <input type="range" min="1" max="5" v-model="participation" /></label>
    <label><input type="checkbox" v-model="shout" /> Teacher shout-out (+2)</label>
    <textarea placeholder="Notes (optional)" v-model="notes"></textarea>
    <button @click="submitForm">Submit</button>
    <p>{{ result }}</p>
  </div>
</template>