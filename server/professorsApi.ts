import { Express } from 'express';
import { MongoClient, ObjectId } from 'mongodb';
import bodyParser from 'body-parser';

export function registerProfessorsApi(app: Express, client: MongoClient, dbName: string) {
  const jsonParser = bodyParser.json();
  const urlencodedParser = bodyParser.urlencoded({ extended: false });

  app.get('/professors', async (req, res) => {
    try {
      const database = client.db(dbName);
      const professors = database.collection('lecturers');
      const professorsList = await professors.find({}).toArray();
      res.json(professorsList);
    } catch (err) {
      res.status(500).send(err);
    }
  });

  app.post('/professors', jsonParser, async (req, res) => {
    try {
      console.log(req.body);
      const newProfessor = {
        _id: new ObjectId(),
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        gender: req.body.gender,
        birthdate: new Date(req.body.birthdate),
        department: req.body.department,
        position: req.body.position,
        children: req.body.children ? parseInt(req.body.children) : 0,
        salary: req.body.salary ? parseInt(req.body.salary) : 0,
        degree: req.body.degree,
        academicTitle: req.body.academicTitle,
        defenseDate: new Date(req.body.defenseDate)
      };
      const database = client.db(dbName);
      const professors = database.collection('lecturers');
      const result = await professors.insertOne(newProfessor);
      res.json(result);
    } catch (error) {
      console.error(error);
      res.status(500).send('Error adding professor');
    }
  });

  app.put('/professors/:id', jsonParser, async (req, res) => {
    try {
      const id = req.params.id;
      const updatedProfessor = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        gender: req.body.gender,
        birthdate: new Date(req.body.birthdate),
        department: req.body.department,
        position: req.body.position,
        children: req.body.children ? parseInt(req.body.children) : 0,
        salary: req.body.salary ? parseInt(req.body.salary) : 0,
        degree: req.body.degree,
        academicTitle: req.body.academicTitle,
        defenseDate: new Date(req.body.defenseDate)
      };

      if (updatedProfessor.gender !== 'male' && updatedProfessor.gender !== 'female') {
        return res.status(400).send('Invalid gender');
      }

      const database = client.db(dbName);
      const professors = database.collection('lecturers');

      const result = await professors.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: updatedProfessor },
      );

      res.json(result);
    } catch (error) {
      console.error(error);
      res.status(500).send('Error updating professor');
    }
  });

  app.delete('/professors/:id', urlencodedParser, async (req, res) => {
    try {
      const id = req.params.id;
      const database = client.db(dbName);
      const professors = database.collection('lecturers');
      const result = await professors.deleteOne({ _id: new ObjectId(id) });
      if (result.deletedCount === 1) {
        res.status(204).send();
      } else {
        res.status(404).send('Professor not found');
      }
    } catch (error) {
      console.error(error);
      res.status(500).send('Error deleting professor');
    }
  });
}
