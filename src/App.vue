<template>
  <v-app>
    <v-app-bar app>
      <v-toolbar-title>
        <v-btn icon="mdi-book-open-page-variant" text to="/"></v-btn>
        ну типа
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn text to="/courses">Курсы</v-btn>
      <v-btn text to="/exams">Экзамены</v-btn>
      <v-btn text to="/professors">Преподаватели</v-btn>
      <v-btn text to="/students">Студенты</v-btn>
    </v-app-bar>
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script lang="ts" setup>
  //
</script>
