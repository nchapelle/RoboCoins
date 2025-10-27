<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuth, api } from '../store';

const store = useAuth();
const students = ref<any[]>([]);
const rewards = ref<any[]>([]);

// form fields
const studentName = ref('');
const studentCode = ref('');
const raterName = ref('');
const raterCode = ref('');
const choreName = ref('');
const chorePoints = ref(1);
const rewardName = ref('');
const rewardCost = ref(5);
const rewardInventory = ref(5);

async function load() {
  if (!store.token) return;
  const a = api(store.token);
  students.value = (await a.get('/api/students')).data;
  rewards.value = (await a.get('/api/rewards')).data;
}
onMounted(load);

async function addStudent() {
  const { data } = await api(store.token).post('/api/students', {
    name: studentName.value,
    code: studentCode.value
  });
  students.value.unshift(data);
  studentName.value = '';
  studentCode.value = '';
}
async function addRater() {
  await api(store.token).post('/api/raters', {
    name: raterName.value,
    code: raterCode.value,
    role: 'Teacher'
  });
  raterName.value = '';
  raterCode.value = '';
}
async function addChore() {
  await api(store.token).post('/api/chores', {
    name: choreName.value,
    defaultPoints: chorePoints.value
  });
  choreName.value = '';
  chorePoints.value = 1;
}
async function addReward() {
  await api(store.token).post('/api/rewards', {
    name: rewardName.value,
    cost: rewardCost.value,
    inventory: rewardInventory.value,
    visibility: 'Private'
  });
  const a = api(store.token);
  rewards.value = (await a.get('/api/rewards')).data;
  rewardName.value = '';
  rewardCost.value = 5;
  rewardInventory.value = 5;
}
</script>

<template>
  <div class="stack">
    <h2 class="h2">Dashboard</h2>
    <p v-if="!store.token" class="text-muted">
      Please log in to manage students, raters, chores, and rewards.
    </p>

    <div v-else class="grid">
      <section class="card card--pad">
        <h3 class="h3">Students</h3>
        <div class="stack mt-2">
          <div>
            <label class="label">Name</label>
            <input class="input" placeholder="Alex Johnson" v-model="studentName" />
          </div>
          <div>
            <label class="label">Code</label>
            <input class="input" placeholder="ALEX01" v-model="studentCode" />
          </div>
          <button class="btn btn--primary" @click="addStudent">Add Student</button>
        </div>
        <table class="table mt-4" v-if="students.length">
          <thead>
            <tr>
              <th>Name</th>
              <th>Code</th>
              <th>Balance</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="s in students" :key="s.id">
              <td>{{ s.name }}</td>
              <td><span class="badge">{{ s.code }}</span></td>
              <td>{{ s.pointsBal }}</td>
            </tr>
          </tbody>
        </table>
        <p v-else class="text-muted mt-4">No students yet.</p>
      </section>

      <section class="card card--pad">
        <h3 class="h3">Raters</h3>
        <div class="stack mt-2">
          <div>
            <label class="label">Name</label>
            <input class="input" placeholder="Ms. Rivera" v-model="raterName" />
          </div>
          <div>
            <label class="label">Code</label>
            <input class="input" placeholder="RIV01" v-model="raterCode" />
          </div>
          <button class="btn btn--secondary" @click="addRater">Add Rater</button>
          <p class="text-muted">Share codes with teachers; no login required for them in MVP.</p>
        </div>
      </section>

      <section class="card card--pad">
        <h3 class="h3">Chores</h3>
        <div class="stack mt-2">
          <div>
            <label class="label">Chore name</label>
            <input class="input" placeholder="Dishwasher" v-model="choreName" />
          </div>
          <div>
            <label class="label">Default points</label>
            <input class="input" type="number" min="0" v-model.number="chorePoints" />
          </div>
          <button class="btn btn--secondary" @click="addChore">Add Chore</button>
        </div>
      </section>

      <section class="card card--pad">
        <h3 class="h3">Rewards</h3>
        <div class="stack mt-2">
          <div>
            <label class="label">Reward name</label>
            <input class="input" placeholder="Choose Movie Night" v-model="rewardName" />
          </div>
          <div class="cluster">
            <div style="flex:1;">
              <label class="label">Cost</label>
              <input class="input" type="number" min="0" v-model.number="rewardCost" />
            </div>
            <div style="flex:1;">
              <label class="label">Inventory</label>
              <input class="input" type="number" min="0" v-model.number="rewardInventory" />
            </div>
          </div>
          <button class="btn