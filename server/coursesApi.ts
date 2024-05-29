import { Express } from 'express';
import { MongoClient, ObjectId } from 'mongodb';
import bodyParser from 'body-parser';

export function registerCoursesApi(app: Express, client: MongoClient, dbName: string) {
  const jsonParser = bodyParser.json();
  const urlencodedParser = bodyParser.urlencoded({ extended: false });

  app.get('/courses', async (req, res) => {
    try {
      const database = client.db(dbName);
      const courses = database.collection('courses');
      const coursesList = await courses.find({}).toArray();
      res.json(coursesList);
    } catch (err) {
      res.status(500).send(err);
    }
  });

  app.post('/courses', jsonParser, async (req, res) => {
    try {
      console.log(req.body);
      const newCourse = {
        _id: new ObjectId(),
        name: req.body.name,
        department: req.body.department,
        course: parseInt(req.body.course), // Ensure course is an int
        year: req.body.year, // Ensure year is a Date
        semester: parseInt(req.body.semester), // Ensure semester is an int
        lectures: parseInt(req.body.lectures), // Ensure lectures is an int
        seminars: parseInt(req.body.seminars), // Ensure seminars is an int
        labs: parseInt(req.body.labs), // Ensure labs is an int
        exams: req.body.exams
      };
      const database = client.db(dbName);
      const courses = database.collection('courses');
      const result = await courses.insertOne(newCourse);
      res.json(result);
    } catch (error) {
      console.error(error);
      res.status(500).send('Error adding course');
    }
  });

  app.put('/courses/:id', jsonParser, async (req, res) => {
    try {
      const id = req.params.id;
      const updatedCourse = {
        name: req.body.name,
        department: req.body.department,
        course: parseInt(req.body.course), // Ensure course is an int
        year: req.body.year, // Ensure year is a Date
        semester: parseInt(req.body.semester), // Ensure semester is an int
        lectures: parseInt(req.body.lectures), // Ensure lectures is an int
        seminars: parseInt(req.body.seminars), // Ensure seminars is an int
        labs: parseInt(req.body.labs), // Ensure labs is an int
        exams: req.body.exams
      };

      const database = client.db(dbName);
      const courses = database.collection('courses');

      const result = await courses.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: updatedCourse },
      );

      res.json(result);
    } catch (error) {
      console.error(error);
      res.status(500).send('Error updating course');
    }
  });

  app.delete('/courses/:id', urlencodedParser, async (req, res) => {
    try {
      const id = req.params.id;
      const database = client.db(dbName);
      const courses = database.collection('courses');
      const result = await courses.deleteOne({ _id: new ObjectId(id) });
      if (result.deletedCount === 1) {
        res.status(204).send();
      } else {
        res.status(404).send('Course not found');
      }
    } catch (error) {
      console.error(error);
      res.status(500).send('Error deleting course');
    }
  });
}
