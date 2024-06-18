import app from "../../firebase.js";
import jwtVerifier from "../../Security/jwtVerifier.js";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { requestLogger as logger } from "../../Security/logger.js";

const db = getFirestore(app);

async function getAllChangeLog(req, res) {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const tokenVerified = await jwtVerifier(token);

        if (tokenVerified || !token) {
            return res.status(401).send({ error: "Unauthorized" });
        }

        const changeLogs = await getChangeLogs();
        if (!changeLogs) {
            return res.status(404).send({ error: "Change logs not found" });
        }

        res.status(201).send(changeLogs);
    } catch (error) {
        logger.error(`Error fetching change logs: ${error.message || error}`);
        res.status(500).send({ error: "Error fetching user" });
    }
}

async function getChangeLogs() {
    try {
        const querySnapshot = await getDocs(collection(db, "changeLogs"));
        return querySnapshot.docs.map(doc => ({ id: doc.id, data: doc.data() }));
    } catch (error) {
        throw new Error(`Error fetching change logs: ${error.message || error}`);
    }
}

export default getAllChangeLog;