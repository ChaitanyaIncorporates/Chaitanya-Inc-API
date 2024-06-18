import express from 'express';
import dotEnv from 'dotenv';
import home from './controllers/home.js';
import middleware from './Security/middleware.js';
import getUser from './controllers/Users/getUser.js';
import uploadPDF from './controllers/Upload/Upload.js';
import updateUser from './controllers/Users/updateUser.js';
import deleteUser from './controllers/Users/deleteUser.js';
import getClient from './controllers/Clients/getClient.js';
import getProject from './controllers/Projects/getProject.js';
import registerUser from './controllers/Users/registerUser.js';
import getCarrier from './controllers/Carriers/getCarriers.js';
import errorHandlingMiddleware from './Security/errorHandler.js';
import createClient from './controllers/Clients/createClient.js';
import createContact from './controllers/Contact/createContact.js';
import getProjectAll from './controllers/Projects/getProjectAll.js';
import createProject from './controllers/Projects/createProject.js';
import getCarrierAll from './controllers/Carriers/getCarriersAll.js';
import createCarrier from './controllers/Carriers/createCarriers.js';
import getChangeLogs from './controllers/ChangeLogs/getChangeLogs.js';
import createChangeLogs from './controllers/ChangeLogs/createChangeLogs.js';
import { exposeMetrics } from './Security/metrics.js';
import getAllChangeLog from './controllers/ChangeLogs/getAllChangeLogs.js';

dotEnv.config();
const app = express();

// Middleware
app.use(express.json());
middleware(app);

// Routes
app.get('/', home);

app.post('/addUser', registerUser);
app.get('/user/:id', getUser);
app.put('/user/:id', updateUser);
app.delete('/user/:id', deleteUser);

app.post('/carrier/create', createCarrier);
app.get('/carrier/:id', getCarrier);
app.get('/carriers', getCarrierAll);

app.post('/changeLog/create', createChangeLogs);
app.get('/changeLog/:id', getChangeLogs);
app.get('/changeLogs', getAllChangeLog);

app.post('/client/create', createClient);
app.get('/client/:id', getClient);

app.post('/contact/create', createContact);

app.post('/project/create', createProject);
app.get('/project/:id', getProject);
app.get('/projects', getProjectAll);

// Standby Routes
// app.post('/Upload', uploadPDF);
// app.get('/contact/:id', getContact);

// Error Handling Middleware
errorHandlingMiddleware(app);

// Server Start
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});