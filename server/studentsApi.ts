import {Express} from "express";
import {MongoClient, ObjectId} from "mongodb";
import bodyParser from "body-parser";

export function registerStudentsApi(app: Express, client: MongoClient, dbName: string) {
  const jsonParser = bodyParser.json()

  const urlencodedParser = bodyParser.urlencoded({ extended: false })

  app.get('/students', async (req, res) => {
    try {
      const database = client.db(dbName);
      const students = database.collection('students');
      const studentsList = await students.find({}).toArray();
      res.json(studentsList);
    } catch (err) {
      res.status(500).send(err);
    }
  });

  app.post('/students', jsonParser, async (req, res) => {
    try {
      console.log(req.body);
      const newStudent = {
        _id: new ObjectId(),
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        gender: req.body.gender,
        birthdate: new Date(req.body.birthdate), // Ensure birthdate is a Date
        faculty: req.body.faculty,
        group: req.body.group,
        studentID: req.body.studentID,
        children: req.body.children ? parseInt(req.body.children) : 0, // Ensure children is an int
        scholarship: req.body.scholarship ? parseInt(req.body.scholarship) : 0 // Ensure scholarship is an int
      };
      const database = client.db(dbName);
      const students = database.collection('students');
      const result = await students.insertOne(newStudent);
      res.json(result);
    } catch (error) {
      console.error(error);
      res.status(500).send('Error adding student');
    }
  });

  app.put('/students/:id', jsonParser, async (req, res) => {
    try {
      const id = req.params.id;
      const updatedStudent = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        gender: req.body.gender,
        birthdate: new Date(req.body.birthdate),
        faculty: req.body.faculty,
        group: req.body.group,
        studentID: req.body.studentID,
        children: req.body.children ? parseInt(req.body.children) : 0,
        scholarship: req.body.scholarship ? parseInt(req.body.scholarship) : 0
      };

      if (updatedStudent.gender !== 'male' && updatedStudent.gender !== 'female') {
        return res.status(400).send('Invalid gender');
      }

      const database = client.db(dbName);
      const students = database.collection('students');

      const result = await students.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: updatedStudent },
      );

      res.json(result);
    } catch (error) {
      console.error(error);
      res.status(500).send('Error updating student');
    }
  });

  app.delete('/students/:id', urlencodedParser, async (req, res) => {
    try {
      const id = req.params.id;
      const database = client.db(dbName);
      const students = database.collection('students');
      const result = await students.deleteOne({ _id: new ObjectId(id) });
      if (result.deletedCount === 1) {
        res.status(204).send();
      } else {
        res.status(404).send('Student not found');
      }
    } catch (error) {
      console.error(error);
      res.status(500).send('Error deleting student');
    }
  });
}
