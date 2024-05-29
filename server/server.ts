import express from 'express';
import {MongoClient} from 'mongodb';
// @ts-ignore
import cors from 'cors';
import {registerStudentsApi} from "./studentsApi";
import {registerCoursesApi} from "./coursesApi";

const app = express();
const port = 5000;

const uri = "mongodb://localhost:27017";
const dbName = "databasename";

const client = new MongoClient(uri);

app.use(cors());

async function connectToDatabase() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error(err);
  }
}

connectToDatabase();

registerStudentsApi(app, client, dbName);
registerCoursesApi(app, client, dbName);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
