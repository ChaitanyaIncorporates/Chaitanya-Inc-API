import app from "../../firebase.js";
import jwtVerifier from "../../Security/jwtVerifier.js";
import { sanitizeString } from "../../Security/Sanitization.js";
import { requestLogger as logger } from '../../Security/logger.js';
import { getAuth, deleteUser as deleteAuthUser } from 'firebase/auth';
import { getFirestore, doc, getDoc, deleteDoc } from 'firebase/firestore';

const db = getFirestore(app);
const auth = getAuth(app);

async function deleteUser(req, res) {
    try {
        const id = sanitizeString(req.params.id);
        const token = req.headers.authorization.split(' ')[1];

        const tokenVerified = await jwtVerifier(token);
        if (!tokenVerified) {
            return res.status(401).send({ error: `UnAuthorized: ${tokenVerified}` });
        }

        if (!id || typeof id !== 'string') {
            return res.status(400).send({ error: "Invalid user ID" });
        }

        await deleteUserData(id);
        res.status(200).send(`User with ID ${id} deleted successfully`);
    } catch (error) {
        logger.error("Error deleting user:", error.message || error);
        res.status(500).send({ error: "Error deleting user" });
    }
}

async function deleteUserData(id) {
    try {
        const docRef = doc(db, "users", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            await Promise.all([
                deleteDoc(docRef),
                deleteAuthUser(auth, id)
            ]);
            logger.info(`User with ID ${id} deleted successfully`);
        } else {
            throw new Error("User not found");
        }
    } catch (error) {
        logger.error("Error deleting user data:", error.message || error);
        throw error;
    }
}

export default deleteUser;