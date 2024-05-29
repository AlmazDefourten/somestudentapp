<template>
  <v-container class = "w-100 h-100 justify-center align-center">
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
      :items="students"
      :search="search"
      class="elevation-11"
    >
      <template v-slot:item.editControl="props">
        <v-btn class="mx-2" fab dark small color="blue" @click="editStudent(props.item)">
          <v-icon dark>mdi-pencil</v-icon>
        </v-btn>
      </template>
      <template v-slot:item.deleteControl="props">
        <v-btn class="mx-2" fab dark small color="red" @click="deleteStudent(props.item._id)">
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
                      v-model="newStudent.gender"
                      :items="genders"
                      :label="field.title"
                      required
                    ></v-select>
                  </template>
                  <template v-else-if="field.value === 'birthdate'">
                    <v-date-input
                      v-model="newStudent[field.value]"
                      label="Дата рождения"
                    ></v-date-input>
                  </template>
                  <template v-else>
                    <v-text-field
                      v-model="newStudent[field.value]"
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
          <v-btn color="blue darken-1" text @click="saveStudent">
            {{ editMode ? 'Сохранить' : 'Добавить' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import {onMounted, ref} from 'vue';
import axios from 'axios';
import {serverApi} from "../../env";

const genders = ['Мужской', 'Женский'];

const students = ref([]);
const dialog = ref(false);
const newStudent = ref({
  firstName: '',
  lastName: '',
  gender: '',
  birthdate: undefined,
  faculty: '',
  group: '',
  studentID: '',
  children: '',
  scholarship: ''
});
const fields = [
  { title: 'Имя', value: 'firstName' },
  { title: 'Фамилия', value: 'lastName' },
  { title: 'Пол', value: 'gender' },
  { title: 'Дата рождения', value: 'birthdate' },
  { title: 'Факультет', value: 'faculty' },
  { title: 'Группа', value: 'group' },
  { title: 'Идентификатор', value: 'studentID' },
  { title: 'Дети', value: 'children' },
  { title: 'Стипендия', value: 'scholarship' }
];
const headers = [
  { title: "", value: "editControl", sortable: false },
  { title: 'Имя', value: 'firstName', sortable: true },
  { title: 'Фамилия', value: 'lastName', sortable: true },
  { title: 'Пол', value: 'gender', sortable: true },
  { title: 'Дата рождения', value: 'birthdate', sortable: true },
  { title: 'Факультет', value: 'faculty', sortable: true },
  { title: 'Группа', value: 'group', sortable: true },
  { title: 'Идентификатор', value: 'studentID', sortable: true },
  { title: 'Дети', value: 'children', sortable: true },
  { title: 'Стипендия', value: 'scholarship', sortable: true },
  { title: "", value: "deleteControl", sortable: false },
];
onMounted(() => {
  fetchData();
})
function delay(ms: number) {
  return new Promise( resolve => setTimeout(resolve, ms) );
}

async function fetchData() {
  loading.value = true;
  await delay(500);
  axios.get(serverApi + 'students')
    .then(response => {
      const formattedStudents = response.data.map((student: any) => {
        if (student.birthdate) {
          const date = new Date(student.birthdate);
          const day = String(date.getDate()).padStart(2, '0');
          const month = String(date.getMonth() + 1).padStart(2, '0'); // Месяцы в JavaScript начинаются с 0
          const year = date.getFullYear();
          student.birthdate = `${day}.${month}.${year}`;
          student.gender = student.gender == 'male' ? genders[0] : genders[1];
        }
        return student;
      });
      students.value = formattedStudents;
      loading.value = false;
    })
    .catch(error => {
      console.error(error);
    });
}

const search = ref("");

const loading = ref(false);

const editMode = ref(false);
const editedIndex = ref(-1);

const saveStudent = async () => {
  newStudent.value.gender = newStudent.value.gender == genders[0] ? 'male' : 'female';
  if (editMode.value) {
    try {
      await axios.put(serverApi+ `students/${newStudent.value._id}`, newStudent.value);
    } catch (error) {
      console.error(error);
    }
  } else {
    try {
      await axios.post(serverApi + 'students', newStudent.value);
    } catch (error) {
      console.error(error);
    }
  }
  await fetchData();
  dialog.value = false;
  resetForm();
};

const resetForm = () => {
  newStudent.value.firstName = '';
  newStudent.value.lastName = '';
  newStudent.value.gender = '';
  newStudent.value.birthdate = undefined;
  newStudent.value.faculty = '';
  newStudent.value.group = '';
  newStudent.value.studentID = '';
  newStudent.value.children = '';
  newStudent.value.scholarship = '';
  editedIndex.value = -1;
  editMode.value = false;
};

const editStudent = (student: any) => {
  editedIndex.value = students.value.indexOf(student);
  Object.assign(newStudent.value, student);
  editMode.value = true;
  dialog.value = true;
};

const deleteStudent = async (id: string) => {
  try {
    await axios.delete(serverApi + `students/${id}`);
    await fetchData();
  } catch (error) {
    console.error(error);
  }
};

</script>

<style scoped>
</style>
