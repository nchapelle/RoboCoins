<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuth, api } from '../store';

const store = useAuth();
const students = ref<any[]>([]);
const rewards = ref<any[]>([]);

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
}
async function addRater() {
  await api(store.token).post('/api/raters', {
    name: raterName.value,
    code: raterCode.value,
    role: 'Teacher'
  });
}
async function addChore() {
  await api(store.token).post('/api/chores', {
    name: choreName.value,
    defaultPoints: chorePoints.value
  });
}
async function addReward() {
  await api(store.token).post('/api/rewards', {
    name: rewardName.value,
    cost: rewardCost.value,
    inventory: rewardInventory.value,
    visibility: 'Private'
  });
  rewards.value = (await api(store.token).get('/api/rewards')).data;
}
</script>

<template>
  <div style="padding: 16px; display:grid; gap:16px;">
    <h2>Dashboard</h2>
    <p v-if="!store.token">Please log in.</p>

    <div v-else style="display:grid; gap:12px; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));">
      <div style="border:1px solid #ddd; padding:12px;">
        <h3>Students</h3>
        <input placeholder="Name" v-model="studentName" />
        <input placeholder="Code (e.g., ALEX01)" v-model="studentCode" />
        <button @click="addStudent">Add Student</button>
        <ul>
          <li v-for="s in students" :key="s.id">{{ s.name }} — code: {{ s.code }} — balance: {{ s.pointsBal }}</li>
        </ul>
      </div>

      <div style="border:1px solid #ddd; padding:12px;">
        <h3>Raters</h3>
        <input placeholder="Name" v-model="raterName" />
        <input placeholder="Code (e.g., RIV01)" v-model="raterCode" />
        <button @click="addRater">Add Rater</button>
        <p>Add your teacher and share only the code with them.</p>
      </div>

      <div style="border:1px solid #ddd; padding:12px;">
        <h3>Chores</h3>
        <input placeholder="Chore name" v-model="choreName" />
        <input type="number" placeholder="Default points" v-model="chorePoints" />
        <button @click="addChore">Add Chore</button>
      </div>

      <div style="border:1px solid #ddd; padding:12px;">
        <h3>Rewards</h3>
        <input placeholder="Reward name" v-model="rewardName" />
        <input type="number" placeholder="Cost" v-model="rewardCost" />
        <input type="number" placeholder="Inventory" v-model="rewardInventory" />
        <button @click="addReward">Add Reward</button>
        <ul>
          <li v-for="r in rewards" :key="r.id">{{ r.name }} — cost: {{ r.cost }} — stock: {{ r.inventory }}</li>
        </ul>
      </div>
    </div>
  </div>
</template>