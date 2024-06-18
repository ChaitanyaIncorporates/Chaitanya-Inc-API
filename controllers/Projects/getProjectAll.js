import app from "../../firebase.js";
import jwtVerifier from "../../Security/jwtVerifier.js";
import { requestLogger as logger } from "../../Security/logger.js";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const db = getFirestore(app);

async function getProjectAll(req, res) {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const tokenVerified = await jwtVerifier(token);

        if (tokenVerified || !token) {
            return res.status(401).send({ error: "Unauthorized" });
        }

        const userData = await getProjects();
        res.status(201).send(userData);
    } catch (error) {
        logger.error("Error fetching user:", error.message || error);
        res.status(500).send({ error: "Error fetching user" });
    }
}

function getProjects() {
    try {
        const querySnapshot = getDocs(collection(db, "projects"));
        return querySnapshot.docs.map(doc => ({ id: doc.id, data: doc.data() }));
    } catch (error) {
        throw new Error(`Error fetching user: ${error.message || error}`);
    }
}

export default getProjectAll;