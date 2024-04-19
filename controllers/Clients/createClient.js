import Joi from "joi";
import app from "../../firebase.js";
import jwtVerifier from "../../Security/jwtVerifier.js";
import { requestLogger as logger } from "../../Security/logger.js";
import { sanitizeObject } from "../../Security/Sanitization.js";
import { getFirestore, collection, addDoc, serverTimestamp, runTransaction, getCountFromServer } from "firebase/firestore";

const db = getFirestore(app);

async function createClient(req, res) {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const tokenVerified = await jwtVerifier(token);
        const data = sanitizeObject(req.body);

        if (tokenVerified) {
            return res.status(401).send({ error: `Unauthorized: ${tokenVerified}` });
        }

        await addClient(data);
        res.status(201).send("Client created successfully!");
    } catch (error) {
        logger.error("Error creating Client:", error);
        res.status(500).send({ error: "Error creating Client" });
    }
}

async function addClient(data) {
    const schema = Joi.object({
        company: Joi.string().min(3).max(101).required(),
        email: Joi.string().min(3).max(101).required(),
        date: Joi.date().required(),
        industry: Joi.string().min(3).max(101).required(),
        otherUserInfo: Joi.object({
            Name: Joi.string().min(3).max(101).required(),
            Phone: Joi.string().min(3).max(101).required(),
            Address: Joi.string().min(3).max(101).required()
        }),
    });
    const { error } = schema.validate(data);
    if (error) throw new Error(error.details[0].message);

    const { company, email, date, industry, otherUserInfo } = data;
    try {
        await runTransaction(db, async (transaction) => {
            const clientID = await generateUniqueClientID();
            await addDoc(collection(db, "clients"), {
                email, role: "Client", clientID,
                company, industry, joinDate: date,
                otherUserInfo, timestamp: serverTimestamp()
            }, { transaction });
        });
    } catch (e) {
        throw new Error(e.message);
    }
}

async function generateUniqueClientID() {
    const snapshot = await getCountFromServer(collection(db, "clients"));
    const count = snapshot.size;
    const ClientID = 'CLT' + String(count + 1).padStart(8, '0');
    return ClientID;
}

export default createClient;