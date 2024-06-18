import app from "../../firebase.js";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import jwtVerifier from "../../Security/jwtVerifier.js";
import { sanitizeString } from "../../Security/Sanitization.js";
import { requestLogger as logger } from "../../Security/logger.js";


const db = getFirestore(app);

async function getClient(req, res) {
    try {
        const id = sanitizeString(req.params.id);
        const token = req.headers.authorization.split(' ')[1];
        const tokenVerified = await jwtVerifier(token);

        if (tokenVerified || !token) {
            return res.status(401).send({ error: "Unauthorized" });
        }

        const clientData = await getClientDoc(id);
        if (!clientData) {
            return res.status(404).send({ error: "Client not found" });
        }

        res.status(200).send(clientData);
    } catch (error) {
        logger.error("Error fetching user: "+ error.message || error);
        res.status(500).send({ error: "Error fetching user" });
    }
}

async function getClientDoc(id) {
    const clientDoc = await getDoc(doc(db, "clients", id));
    return clientDoc.exists() ? clientDoc.data() : null;
}

export default getClient;