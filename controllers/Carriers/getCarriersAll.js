import app from "../../firebase.js";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import jwtVerifier from "../../Security/jwtVerifier.js";
import { requestLogger as logger } from "../../Security/logger.js";

const db = getFirestore(app);

async function getUsers(req, res) {
    try {
        const token = req.headers.authorization.split(' ')[1];

        const tokenVerified = await jwtVerifier(token);
        if (tokenVerified || !token) {
            return res.status(401).send({ error: "Unauthorized" });
        }

        const carrierData = await getCarrierData();
        if (!carrierData) {
            return res.status(404).send({ error: "No Opened Postion" });
        }

        res.status(200).send(carrierData);
    } catch (error) {
        logger.error(`Error fetching carrier document: ${error.message || error}`);
        res.status(500).send({ error: "Error fetching carrier" });
    }
}

async function getCarrierData() {
    try {
        const querySnapshot = await getDocs(collection(db, "carriers"));
        return querySnapshot.docs.map(doc => ({ id: doc.id, data: doc.data() }));
    } catch (error) {
        throw new Error(`Error fetching carrier data: ${error.message || error}`);
    }
}

export default getUsers;