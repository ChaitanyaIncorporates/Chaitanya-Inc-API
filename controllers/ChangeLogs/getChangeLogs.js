import app from "../../firebase.js";
import jwtVerifier from "../../Security/jwtVerifier.js";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { sanitizeString } from "../../Security/Sanitization.js";
import { requestLogger as logger } from "../../Security/logger.js";

const db = getFirestore(app);

async function getChangeLogs(req, res) {
    try {
        const id = sanitizeString(req.params.id);
        const token = req.headers.authorization.split(' ')[1];

        const tokenVerified = await jwtVerifier(token);
        if (tokenVerified) {
            return res.status(401).send({ error: `Unauthorized: ${tokenVerified}` });
        }

        const changeLogData = await getChangeLogData(id);
        if (!changeLogData) {
            return res.status(404).send({ error: "Change log not found" });
        }
        res.status(200).send(changeLogData);
    } catch (error) {
        logger.error("Error fetching change logs:", error.message || error);
        res.status(500).send({ error: "Error fetching change logs" });
    }
}

async function getChangeLogData(id) {
    const changeLogDoc = await getDoc(doc(db, "changeLogs", id));
    return (changeLogDoc.exists()) ? changeLogDoc.data() : null;
}

export default getChangeLogs;