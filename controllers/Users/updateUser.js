import app from "../../firebase.js";
import jwtVerifier from "../../Security/jwtVerifier.js";
import { doc, setDoc, getFirestore } from "firebase/firestore";
import { sanitizeObject, sanitizeString } from "../../Security/Sanitization.js";
import { requestLogger as logger } from '../../Security/logger.js';

const db = getFirestore(app);

async function updateUser(req, res) {
    try {
        const id = sanitizeString(req.params.id);
        const token = req.headers.authorization.split(' ')[1];
        const tokenVerified = await jwtVerifier(token);

        if (tokenVerified) {
            return res.status(401).send({ error: "Unauthorized" });
        }

        if (!id || typeof id !== 'string') {
            return res.status(400).send({ error: "Invalid user ID" });
        }

        const updatedData = sanitizeObject(req.body);
        await updateDataUser(id, updatedData);

        logger.info(`User with ID: ${id} updated successfully`);
        res.status(200).send(`User with ID: ${id} updated successfully`);
    } catch (error) {
        logger.error("Error updating user:", error.message || error);
        res.status(500).send({ error: "Error updating user" });
    }
}

async function updateDataUser(id, data) {
    try {
        const userRef = doc(db, "users", id);
        await setDoc(userRef, data, { merge: true });
    } catch (error) {
        throw new Error("Error updating user data: ", error.message || error);
    }
}

export default updateUser;  