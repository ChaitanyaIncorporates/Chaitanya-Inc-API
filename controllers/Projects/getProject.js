import app from "../../firebase.js";
import jwtVerifier from "../../Security/jwtVerifier.js";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { sanitizeString } from "../../Security/Sanitization.js";
import { requestLogger as logger } from "../../Security/logger.js";

async function getProject(req, res) {
    try {
        const id = sanitizeString(req.params.id);
        const token = req.headers.authorization.split(' ')[1];
        const tokenVerified = await jwtVerifier(token);

        if (tokenVerified || !token) {
            return res.status(401).send({ error: "Unauthorized access" });
        }

        const projectData = await getProjectData(id);
        if (!projectData) {
            return res.status(404).send({ error: "Project not found" });
        }

        res.status(200).send(projectData);
    } catch (error) {
        logger.error("Error fetching project:", error.message || error);
        res.status(500).send({ error: "Error fetching project" });
    }
}

async function getProjectData(id) {
    try {
        const projectDoc = await getDoc(doc(getFirestore(app), "projects", id));
        return (projectDoc.exists()) ? projectDoc.data() : null;
    } catch (e) {
        throw new Error(`Error fetching project from database: ${e}`);
    }
}

export default getProject;