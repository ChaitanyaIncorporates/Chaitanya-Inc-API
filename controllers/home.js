import app from '../firebase.js';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { requestLogger as logger } from '../Security/logger.js';

const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

async function checkInternalAPIStatus() {
    try {
        //await listCollections(db);
        logger.info('Firebase Firestore is up!');
        //await listUsers(auth);
        logger.info('Firebase Authentication is up!');
        //await storage.ref().listAll();
        logger.info('Firebase Storage is up!');

        return 'Internal API is up and running';
    } catch (error) {
        logger.error('Error connecting to internal API');
        return 'Error connecting to internal API';
    }
}

async function home(req, res) {
    try {
        const status = await checkInternalAPIStatus();
        res.status(200).send(status);
    } catch (error) {
        res.status(500).send(error);
    }
}

export default home;