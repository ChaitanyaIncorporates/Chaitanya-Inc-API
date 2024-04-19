import app from "../../firebase.js";
import jwtVerifier from "../../Security/jwtVerifier.js";
import { getDoc, getFirestore, doc } from "firebase/firestore";
import { sanitizeString } from "../../Security/Sanitization.js";
import { requestLogger as logger } from '../../Security/logger.js';

const db = getFirestore(app);

async function getUser(req, res) {
    try {
        const id = sanitizeString(req.params.id);
        const token = req.headers.authorization.split(' ')[1];

        const tokenVerified = await jwtVerifier(token);
        if (tokenVerified) {
            return res.status(401).send({ error: `UnAuthorized: ${tokenVerified}` });
        }

        const userData = await fetchUser(id);
        if (!userData) {
            return res.status(404).send({ error: "User not found" });
        }

        res.status(200).send(userData);
    } catch (error) {
        logger.error("Error fetching user:", error);
        res.status(500).send({ error: "Error fetching user" });
    }
}

async function fetchUser(id) {
    try {
        const userDocRef = doc(db, "users", id);
        const userDocSnap = await getDoc(userDocRef);
        return (userDocSnap.exists()) ? userDocSnap.data() : null;
    } catch (error) {
        logger.error("Error fetching user document:", error);
        throw new Error("Error fetching user document");
    }
}

export default getUser;