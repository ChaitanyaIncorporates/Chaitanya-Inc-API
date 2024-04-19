import express from 'express';
import dotEnv from 'dotenv';
import home from './controllers/home.js';
import middleware from './Security/middleware.js';
import getUser from './controllers/Users/getUser.js';
import uploadPDF from './controllers/Upload/Upload.js';
import errorHandlingMiddleware from './Security/errorHandler.js';
import updateUser from './controllers/Users/updateUser.js';
import deleteUser from './controllers/Users/deleteUser.js';
import getClient from './controllers/Clients/getClient.js';
import registerUser from './controllers/Users/registerUser.js';
import getCarrier from './controllers/Carriers/getCarriers.js';
import createClient from './controllers/Clients/createClient.js';
import createContact from './controllers/Contact/createContact.js';
import createCarrier from './controllers/Carriers/createCarriers.js';
import getChangeLogs from './controllers/ChangeLogs/getChangeLogs.js';
import createChangeLogs from './controllers/ChangeLogs/createChangeLogs.js';
import { exposeMetrics } from './Security/metrics.js';

dotEnv.config();
const app = express();

// Middleware
app.use(express.json());
middleware(app);

// Routes
app.get('/', home);
app.get('/metrics', exposeMetrics);

app.post('/addUser', registerUser);
app.get('/user/:id', getUser);
app.put('/user/:id', updateUser);
app.delete('/user/:id', deleteUser);

app.post('/carrier/create', createCarrier);
app.get('/carrier/:id', getCarrier);

app.post('/changeLogs/create', createChangeLogs);
app.get('/changeLogs/:id', getChangeLogs);

app.post('/client/create', createClient);
app.get('/client/:id', getClient);

app.post('/contact/create', createContact);

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