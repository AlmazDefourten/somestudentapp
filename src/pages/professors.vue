<template>
  <v-container class="w-100 h-100 justify-center align-center">
    <v-btn @click="() => { resetForm(); editMode = false; dialog = true; }" color="primary" class="ma-2">
      Добавить запись
    </v-btn>

    <v-btn @click="() => { fetchData(); }" color="secondary" class="ma-2">
      Обновить
    </v-btn>

    <v-spacer />

    <v-text-field
      v-model="search"
      density="compact"
      label="Search"
      prepend-inner-icon="mdi-magnify"
      variant="solo-filled"
      flat
      hide-details
      single-line
    ></v-text-field>

    <v-data-table
      :loading="loading"
      :headers="headers"
      :items="professors"
      :search="search"
      class="elevation-11"
    >
      <template v-slot:item.birthdate="{ item }">
        {{ getFormattedDate(item.birthdate) }}
      </template>
      <template v-slot:item.defenseDate="{ item }">
        {{ getFormattedDate(item.defenseDate) }}
      </template>
      <template v-slot:item.editControl="props">
        <v-btn class="mx-2" fab dark small color="blue" @click="editProfessor(props.item)">
          <v-icon dark>mdi-pencil</v-icon>
        </v-btn>
      </template>
      <template v-slot:item.deleteControl="props">
        <v-btn class="mx-2" fab dark small color="red" @click="deleteProfessor(props.item._id)">
          <v-icon dark>mdi-delete</v-icon>
        </v-btn>
      </template>
    </v-data-table>

    <v-dialog v-model="dialog" max-width="600px">
      <v-card>
        <v-card-title>
          <span class="headline">{{ editMode ? 'Редактировать запись' : 'Добавить запись' }}</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-form ref="form">
              <v-row v-for="(field, index) in fields" :key="index">
                <v-col cols="12">
                  <template v-if="field.value === 'gender'">
                    <v-select
                      v-model="newProfessor.gender"
                      :items="genders"
                      :label="field.title"
                      required
                    ></v-select>
                  </template>
                  <template v-else-if="field.value === 'birthdate' || field.value === 'defenseDate'">
                    <v-date-input
                      v-model="newProfessor[field.value]"
                      :label="field.title"
                    ></v-date-input>
                  </template>
                  <template v-else>
                    <v-text-field
                      v-model="newProfessor[field.value]"
                      :label="field.title"
                      placeholder="Введите значение"
                    ></v-text-field>
                  </template>
                </v-col>
              </v-row>
            </v-form>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="dialog = false">
            Отмена
          </v-btn>
          <v-btn color="blue darken-1" text @click="saveProfessor">
            {{ editMode ? 'Сохранить' : 'Добавить' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import axios from 'axios';
import { serverApi } from "../../env";

const genders = ['Мужской', 'Женский'];

const professors = ref([]);
const dialog = ref(false);
const newProfessor = ref({
  firstName: '',
  lastName: '',
  gender: '',
  birthdate: undefined,
  department: '',
  position: '',
  children: '',
  salary: '',
  degree: '',
  academicTitle: '',
  defenseDate: undefined
});
const fields = [
  { title: 'Имя', value: 'firstName' },
  { title: 'Фамилия', value: 'lastName' },
  { title: 'Пол', value: 'gender' },
  { title: 'Дата рождения', value: 'birthdate' },
  { title: 'Кафедра', value: 'department' },
  { title: 'Должность', value: 'position' },
  { title: 'Дети', value: 'children' },
  { title: 'Зарплата', value: 'salary' },
  { title: 'Учёная степень', value: 'degree' },
  { title: 'Учёное звание', value: 'academicTitle' },
  { title: 'Дата защиты', value: 'defenseDate' }
];
const headers = [
  { title: "", value: "editControl", sortable: false },
  { title: 'Имя', value: 'firstName', sortable: true },
  { title: 'Фамилия', value: 'lastName', sortable: true },
  { title: 'Пол', value: 'gender', sortable: true },
  { title: 'Дата рождения', value: 'birthdate', sortable: true },
  { title: 'Кафедра', value: 'department', sortable: true },
  { title: 'Должность', value: 'position', sortable: true },
  { title: 'Дети', value: 'children', sortable: true },
  { title: 'Зарплата', value: 'salary', sortable: true },
  { title: 'Учёная степень', value: 'degree', sortable: true },
  { title: 'Учёное звание', value: 'academicTitle', sortable: true },
  { title: 'Дата защиты', value: 'defenseDate', sortable: true },
  { title: "", value: "deleteControl", sortable: false }
];

onMounted(() => {
  fetchData();
});

function getFormattedDate(dateInput: Date): string {
  const date = new Date(dateInput);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Месяцы в JavaScript начинаются с 0
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
}

const loading = ref(false);
const search = ref("");
const editMode = ref(false);
const editedIndex = ref(-1);

async function fetchData() {
  loading.value = true;
  await delay(500);
  axios.get(serverApi + 'professors')
    .then(response => {
      const formattedProfessors = response.data.map((professor: any) => {
        professor.birthdate = new Date(professor.birthdate);
        professor.defenseDate = new Date(professor.defenseDate);
        professor.gender = professor.gender == 'male' ? genders[0] : genders[1];
        return professor;
      });
      professors.value = formattedProfessors;
      loading.value = false;
    })
    .catch(error => {
      console.error(error);
    });
}

const saveProfessor = async () => {
  newProfessor.value.gender = newProfessor.value.gender == genders[0] ? 'male' : 'female';
  if (editMode.value) {
    try {
      await axios.put(serverApi + `professors/${newProfessor.value._id}`, newProfessor.value);
    } catch (error) {
      console.error(error);
    }
  } else {
    try {
      await axios.post(serverApi + 'professors', newProfessor.value);
    } catch (error) {
      console.error(error);
    }
  }
  await fetchData();
  dialog.value = false;
  resetForm();
};

const resetForm = () => {
  newProfessor.value.firstName = '';
  newProfessor.value.lastName = '';
  newProfessor.value.gender = '';
  newProfessor.value.birthdate = undefined;
  newProfessor.value.department = '';
  newProfessor.value.position = '';
  newProfessor.value.children = '';
  newProfessor.value.salary = '';
  newProfessor.value.degree = '';
  newProfessor.value.academicTitle = '';
  newProfessor.value.defenseDate = undefined;
  editedIndex.value = -1;
  editMode.value = false;
};

const editProfessor = (professor: any) => {
  editedIndex.value = professors.value.indexOf(professor);
  Object.assign(newProfessor.value, professor);
  editMode.value = true;
  dialog.value = true;
};

const deleteProfessor = async (id: string) => {
  try {
    await axios.delete(serverApi + `professors/${id}`);
    await fetchData();
  } catch (error) {
    console.error(error);
  }
};

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
</script>

<style scoped>
</style>
