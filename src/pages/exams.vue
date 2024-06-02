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
      :items="exams"
      :search="search"
      class="elevation-11"
    >
      <template v-slot:item.date="{ item }">
        {{ formatDate(item.date) }}
      </template>
      <template v-slot:item.type="{ item }">
        {{ formatExamType(item.type) }}
      </template>
      <template v-slot:item.editControl="props">
        <v-btn class="mx-2" fab dark small color="blue" @click="editExam(props.item)">
          <v-icon dark>mdi-pencil</v-icon>
        </v-btn>
      </template>
      <template v-slot:item.studentsControl="props">
        <v-btn class="mx-2" fab dark small color="green" @click="editStudents(props.item)">
          <v-icon dark>mdi-account-group</v-icon>
        </v-btn>
      </template>
      <template v-slot:item.deleteControl="props">
        <v-btn class="mx-2" fab dark small color="red" @click="deleteExam(props.item._id)">
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
                  <template v-if="field.value === 'type'">
                    <v-select
                      v-model="newExam.type"
                      :items="examTypes"
                      :label="field.title"
                      required
                    ></v-select>
                  </template>
                  <template v-else-if="field.value === 'date'">
                    <v-date-input
                      v-model="newExam.date"
                      :label="field.title"
                    ></v-date-input>
                  </template>
                  <template v-else>
                    <v-text-field
                      v-model="newExam[field.value]"
                      :label="field.title"
                      placeholder="Введите значение"
                      required
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
          <v-btn color="blue darken-1" text @click="saveExam">
            {{ editMode ? 'Сохранить' : 'Добавить' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="studentDialog" max-width="600px">
      <v-card>
        <v-card-title>
          <span class="headline">Оценки по экзамену</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-data-table
              :headers="studentHeaders"
              :items="students"
              :items-per-page="5"
              class="elevation-1"
            >
              <template v-slot:item.fullName="{ item }">
                {{ item.firstName + ' ' + item.lastName }}
              </template>
              <template v-slot:item.editGrade="props">
                <v-text-field v-model="props.item.grade" label="Оценка"></v-text-field>
              </template>
            </v-data-table>
            <v-btn @click="openAddStudentDialog" color="primary" class="ma-2">
              Добавить студента
            </v-btn>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="studentDialog = false">
            Отмена
          </v-btn>
          <v-btn color="blue darken-1" text @click="saveStudents">
            Сохранить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="addStudentDialog" max-width="400px">
      <v-card>
        <v-card-title>
          <span class="headline">Добавить студента</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-select
              v-model="selectedStudent"
              :items="availableStudents"
              item-title="fullName"
              item-value="_id"
              label="Студент"
            ></v-select>
            <v-text-field v-model="newGrade" label="Оценка"></v-text-field>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="addStudentDialog = false">
            Отмена
          </v-btn>
          <v-btn color="blue darken-1" text @click="addStudent">
            Добавить
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

const examTypes = ['exam', 'test'];

const exams = ref([]);
const students = ref([]);
const dialog = ref(false);
const studentDialog = ref(false);
const newExam = ref({
  date: undefined,
  lecturer: '',
  course: '',
  group: '',
  type: '',
  semester: 0,
  students: []
});
const fields = [
  { title: 'Дата', value: 'date' },
  { title: 'Преподаватель', value: 'lecturer' },
  { title: 'Курс', value: 'course' },
  { title: 'Группа', value: 'group' },
  { title: 'Тип', value: 'type' },
  { title: 'Семестр', value: 'semester' }
];
const studentHeaders = [
  { title: 'Имя', value: 'fullName', sortable: false },
  { title: 'Группа', value: 'group', sortable: false },
  { title: 'Факультет', value: 'faculty', sortable: false },
  { title: 'Оценка', value: 'editGrade', sortable: false }
];
const headers = [
  { title: "", value: "editControl", sortable: false },
  { title: 'Дата', value: 'date', sortable: true },
  { title: 'Преподаватель', value: 'lecturer', sortable: true },
  { title: 'Курс', value: 'course', sortable: true },
  { title: 'Группа', value: 'group', sortable: true },
  { title: 'Тип', value: 'type', sortable: true },
  { title: 'Семестр', value: 'semester', sortable: true },
  { title: 'Оценки', value: 'studentsControl', sortable: false },
  { title: "", value: "deleteControl", sortable: false }
];
onMounted(() => {
  fetchData();
});

const availableStudents = ref([]);
const addStudentDialog = ref(false);
const selectedStudent = ref(null);
const newGrade = ref('');

// Открыть диалоговое окно для добавления студента
const openAddStudentDialog = async () => {
  await fetchAvailableStudents();
  addStudentDialog.value = true;
};

// Получить доступных студентов
const fetchAvailableStudents = async () => {
  try {
    const response = await axios.get(serverApi + 'students');
    availableStudents.value = response.data.map(student => ({
      ...student,
      fullName: `${student.firstName} ${student.lastName}`
    }));
    console.log(availableStudents);
  } catch (error) {
    console.error(error);
  }
};

// Добавить студента с оценкой
const addStudent = () => {
  const student = availableStudents.value.find(s => s._id === selectedStudent.value);
  if (student) {
    students.value.push({
      ...student,
      grade: newGrade.value
    });
    addStudentDialog.value = false;
    selectedStudent.value = null;
    newGrade.value = '';
  }
};

const loading = ref(false);
const search = ref("");
const editMode = ref(false);
const editedIndex = ref(-1);
const selectedExam = ref(null);

async function fetchData() {
  loading.value = true;
  await delay(500);
  axios.get(serverApi + 'exams')
    .then(response => {
      const formattedExams = response.data.map((exam: any) => {
        exam.date = new Date(exam.date);
        return exam;
      });
      exams.value = formattedExams;
      loading.value = false;
    })
    .catch(error => {
      console.error(error);
    });
}

const saveExam = async () => {
  try {
    if (newExam.value.type !== 'exam' && newExam.value.type !== 'test') {
      alert('Invalid exam type');
      return;
    }

    if (editMode.value) {
      await axios.put(serverApi + `exams/${newExam.value._id}`, newExam.value);
    } else {
      await axios.post(serverApi + 'exams', newExam.value);
    }

    await fetchData();
    dialog.value = false;
    resetForm();
  } catch (error) {
    console.error(error);
    alert('Error saving exam');
  }
};

const resetForm = () => {
  newExam.value = {
    date: undefined,
    lecturer: '',
    course: '',
    group: '',
    type: '',
    semester: 0,
    students: []
  };
  editedIndex.value = -1;
  editMode.value = false;
};

const editExam = (exam: any) => {
  editedIndex.value = exams.value.indexOf(exam);
  newExam.value = { ...exam };
  editMode.value = true;
  dialog.value = true;
};

const deleteExam = async (id: string) => {
  try {
    await axios.delete(serverApi + `exams/${id}`);
    await fetchData();
  } catch (error) {
    console.error(error);
  }
};

const editStudents = async (exam: any) => {
  selectedExam.value = exam;
  await fetchStudents();
  studentDialog.value = true;
};

const fetchStudents = async () => {
  try {
    const studentIds = selectedExam.value.students.map((s: any) => s.studentID);
    const response = await axios.get(serverApi + 'studentsgrades', {
      params: {
        ids: studentIds
      }
    });

    const fetchedStudents = response.data.map((student: any) => {
      const examStudent = selectedExam.value.students.find((s: any) => s.studentID === student.studentID);
      return {
        ...student,
        grade: examStudent ? examStudent.grade : ''
      };
    });

    students.value = fetchedStudents;
  } catch (error) {
    console.error(error);
  }
};

const saveStudents = async (item) => {
  console.log(item);
  const updatedStudents = students.value.map((student: any) => ({
    studentID: student.studentID,
    grade: student.grade
  }));

  try {
    await axios.put(serverApi + `exams/${selectedExam.value._id}/students`, { students: updatedStudents });
    await fetchData();
    studentDialog.value = false;
  } catch (error) {
    console.error(error);
    alert('Error saving students');
  }
};

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function formatDate(date: string) {
  const formattedDate = new Date(date);
  const day = String(formattedDate.getDate()).padStart(2, '0');
  const month = String(formattedDate.getMonth() + 1).padStart(2, '0');
  const year = formattedDate.getFullYear();
  return `${day}.${month}.${year}`;
}

function formatExamType(type: string) {
  return type === 'exam' ? 'Экзамен' : 'Тест';
}
</script>

<style scoped>
</style>
