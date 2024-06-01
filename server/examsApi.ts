import { Express } from 'express';
import { MongoClient, ObjectId } from 'mongodb';
import bodyParser from 'body-parser';

export function registerExamsApi(app: Express, client: MongoClient, dbName: string) {
  const jsonParser = bodyParser.json();
  const urlencodedParser = bodyParser.urlencoded({ extended: false });

  app.get('/exams', async (req, res) => {
    try {
      const database = client.db(dbName);
      const exams = database.collection('exams');
      const examsList = await exams.find({}).toArray();
      res.json(examsList);
    } catch (err) {
      res.status(500).send(err);
    }
  });

  app.post('/exams', jsonParser, async (req, res) => {
    try {
      const newExam = {
        _id: new ObjectId(),
        date: new Date(req.body.date),
        lecturer: req.body.lecturer,
        course: req.body.course,
        group: req.body.group,
        type: req.body.type,
        semester: req.body.semester ? parseInt(req.body.semester) : 0,
        students: req.body.students.map((student) => ({
          studentID: student.studentID,
          grade: typeof student.grade === 'string' ? student.grade : parseInt(student.grade)
        }))
      };

      const database = client.db(dbName);
      const exams = database.collection('exams');
      const result = await exams.insertOne(newExam);
      res.json(result);
    } catch (error) {
      console.error(error);
      res.status(500).send('Error adding exam');
    }
  });

  app.put('/exams/:id', jsonParser, async (req, res) => {
    try {
      const id = req.params.id;
      const updatedExam = {
        date: new Date(req.body.date),
        lecturer: req.body.lecturer,
        course: req.body.course,
        group: req.body.group,
        type: req.body.type,
        semester: req.body.semester ? parseInt(req.body.semester) : 0,
        students: req.body.students.map((student) => ({
          studentID: student.studentID,
          grade: typeof student.grade === 'string' ? student.grade : parseInt(student.grade)
        }))
      };

      const database = client.db(dbName);
      const exams = database.collection('exams');

      const result = await exams.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: updatedExam }
      );

      res.json(result);
    } catch (error) {
      console.error(error);
      res.status(500).send('Error updating exam');
    }
  });

  app.delete('/exams/:id', urlencodedParser, async (req, res) => {
    try {
      const id = req.params.id;
      const database = client.db(dbName);
      const exams = database.collection('exams');
      const result = await exams.deleteOne({ _id: new ObjectId(id) });
      if (result.deletedCount === 1) {
        res.status(204).send();
      } else {
        res.status(404).send('Exam not found');
      }
    } catch (error) {
      console.error(error);
      res.status(500).send('Error deleting exam');
    }
  });

  app.put('/exams/:id/students', jsonParser, async (req, res) => {
    try {
      const id = req.params.id;
      const updatedStudents = req.body.students.map((student) => ({
        studentID: student.studentID,
        grade: student.grade
      }));

      const database = client.db(dbName);
      const exams = database.collection('exams');

      const result = await exams.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: { students: updatedStudents } }
      );

      res.json(result);
    } catch (error) {
      console.error(error);
      res.status(500).send('Error updating students in exam');
    }
  });
}
