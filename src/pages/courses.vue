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
      :items="courses"
      :search="search"
      class="elevation-11"
    >
      <template v-slot:item.editControl="props">
        <v-btn class="mx-2" fab dark small color="blue" @click="editCourse(props.item)">
          <v-icon dark>mdi-pencil</v-icon>
        </v-btn>
      </template>
      <template v-slot:item.deleteControl="props">
        <v-btn class="mx-2" fab dark small color="red" @click="deleteCourse(props.item._id)">
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
                  <template v-if="field.value === 'exams'">
                    <v-select
                      v-model="newCourse[field.value]"
                      :items="examTypesLabels"
                      :label="field.title"
                      required
                    ></v-select>
                  </template>
                  <template v-else>
                    <v-text-field
                      v-model="newCourse[field.value]"
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
          <v-btn color="blue darken-1" text @click="saveCourse">
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

const courses = ref([]);
const dialog = ref(false);
const newCourse = ref({
  name: '',
  department: '',
  course: '',
  year: undefined,
  semester: '',
  lectures: '',
  seminars: '',
  labs: '',
  exams: ''
});
const fields = [
  { title: 'Название курса', value: 'name' },
  { title: 'Кафедра', value: 'department' },
  { title: 'Курс', value: 'course' },
  { title: 'Учебный год', value: 'year' },
  { title: 'Семестр', value: 'semester' },
  { title: 'Лекции', value: 'lectures' },
  { title: 'Семинары', value: 'seminars' },
  { title: 'Лабораторные работы', value: 'labs' },
  { title: 'Экзамен', value: 'exams' }
];
const headers = [
  { title: "", value: "editControl", sortable: false },
  { title: 'Название курса', value: 'name', sortable: true },
  { title: 'Кафедра', value: 'department', sortable: true },
  { title: 'Курс', value: 'course', sortable: true },
  { title: 'Учебный год', value: 'year', sortable: true },
  { title: 'Семестр', value: 'semester', sortable: true },
  { title: 'Лекции', value: 'lectures', sortable: true },
  { title: 'Семинары', value: 'seminars', sortable: true },
  { title: 'Лабораторные работы', value: 'labs', sortable: true },
  { title: 'Экзамен', value: 'exams', sortable: true },
  { title: "", value: "deleteControl", sortable: false },
];

onMounted(() => {
  fetchData();
})

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchData() {
  loading.value = true;
  await delay(500);
  axios.get(serverApi + 'courses')
    .then(response => {
      const formattedCourses = response.data.map((course: any) => {
        course.exams = course.exams == examTypes[0] ? examTypesLabels[0] : examTypesLabels[1];
        return course;
      });
      courses.value = formattedCourses;
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

const examTypes = ["exam", "test"];
const examTypesLabels = ["Экзамен", "Тест"];

const saveCourse = async () => {
  newCourse.value.exams = newCourse.value.exams == examTypesLabels[0] ? examTypes[0] : examTypes[1];
  if (editMode.value) {
    try {
      await axios.put(serverApi + `courses/${newCourse.value._id}`, newCourse.value);
    } catch (error) {
      console.error(error);
    }
  } else {
    try {
      await axios.post(serverApi + 'courses', newCourse.value);
    } catch (error) {
      console.error(error);
    }
  }
  await fetchData();
  dialog.value = false;
  resetForm();
};

const resetForm = () => {
  newCourse.value.name = '';
  newCourse.value.department = '';
  newCourse.value.course = '';
  newCourse.value.year = undefined;
  newCourse.value.semester = '';
  newCourse.value.lectures = '';
  newCourse.value.seminars = '';
  newCourse.value.labs = '';
  newCourse.value.exams = '';
  editedIndex.value = -1;
  editMode.value = false;
};

const editCourse = (course: any) => {
  editedIndex.value = courses.value.indexOf(course);
  Object.assign(newCourse.value, course);
  editMode.value = true;
  dialog.value = true;
};

const deleteCourse = async (id: string) => {
  try {
    await axios.delete(serverApi + `courses/${id}`);
    await fetchData();
  } catch (error) {
    console.error(error);
  }
};

</script>

<style scoped>
</style>
