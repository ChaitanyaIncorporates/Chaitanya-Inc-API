import jwtVerifier from "../../Security/jwtVerifier.js";
import { sanitizeString } from "../../Security/Sanitization.js";
import { requestLogger as logger } from "../../Security/logger.js";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import app from "../../firebase.js";

const db = getFirestore(app);

async function getCarriers(req, res) {
    try {
        const id = sanitizeString(req.params.id);
        const token = req.headers.authorization.split(' ')[1];

        const tokenVerified = await jwtVerifier(token);
        if (tokenVerified) {
            return res.status(401).send({ error: `Unauthorized: ${tokenVerified}` });
        }

        const carrierData = await getCarrierData(id);
        if (!carrierData) {
            return res.status(404).send({ error: "Carrier not found" });
        }

        res.status(200).send(carrierData);
    } catch (error) {
        logger.error("Error fetching carrier:", error.message || error);
        res.status(500).send({ error: "Error fetching carrier" });
    }
}

async function getCarrierData(id) {
    try {
        const carrierDoc = await getDoc(doc(db, "carriers", id));
        return (carrierDoc.exists()) ? carrierDoc.data() : null;
    } catch (error) {
        logger.error("Error fetching carrier document:", error.message || error);
        throw new Error("Error fetching carrier document");
    }
}

export default getCarriers;