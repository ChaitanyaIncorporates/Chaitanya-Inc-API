import app from "../../firebase.js";
import { getFirestore, } from "firebase/firestore";
import jwtVerifier from "../../Security/jwtVerifier.js";
import { requestLogger as logger } from "../../Security/logger.js";

const db = getFirestore(app);

async function getAllChangeLog(req, res) {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const tokenVerified = await jwtVerifier(token);

        if (!tokenVerified) {
            return res.status(401).send({ error: `Unauthorized: ${tokenVerified}` });
        }

        const userData = await getChangeLogs();
        res.status(201).send(userData);
    } catch (error) {
        logger.error("Error fetching user:", error);
        res.status(500).send({ error: "Error fetching user" });
    }
}

async function getChangeLogs(id) {
    const querySnapshot = await getDocs(collection(db, "change_logs"));
    const users = [];

    querySnapshot.forEach(doc => { users.push({ id: doc.id, data: doc.data() }); });
    return users;
}

export default getAllChangeLog;