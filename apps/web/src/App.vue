<template>
  <div>
    <header class="nav">
      <div class="container nav__inner">
        <div class="cluster">
          <span style="font-weight:800; color: var(--color-primary)">RoboCoins</span>
        </div>
        <div class="cluster" style="margin-left:auto;">
          <router-link to="/" class="badge">Dashboard</router-link>
          <router-link to="/teacher" class="badge">Teacher Form</router-link>
          <router-link to="/chore" class="badge">Chore Form</router-link>
          <router-link to="/rewards" class="badge">Rewards</router-link>
          <router-link to="/login" class="badge">Login</router-link>
        </div>
      </div>
    </header>
    <main class="container" style="padding-block: var(--space-6);">
      <router-view />
    </main>
  </div>
</template>