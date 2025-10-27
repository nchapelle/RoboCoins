<template>
  <div>
    <nav style="padding: 12px; border-bottom: 1px solid #eee; display:flex; gap:12px;">
      <router-link to="/">Dashboard</router-link>
      <router-link to="/teacher">Teacher Form</router-link>
      <router-link to="/chore">Chore Form</router-link>
      <router-link to="/rewards">Rewards</router-link>
      <span style="margin-left:auto">
        <router-link to="/login">Login</router-link>
      </span>
    </nav>
    <router-view />
  </div>
</template>