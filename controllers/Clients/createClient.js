import Joi from "joi";
import app from "../../firebase.js";
import jwtVerifier from "../../Security/jwtVerifier.js";
import { requestLogger as logger } from "../../Security/logger.js";
import { sanitizeObject } from "../../Security/Sanitization.js";
import { getFirestore, collection, addDoc, doc, serverTimestamp, runTransaction } from "firebase/firestore";

const db = getFirestore(app);

async function createClient(req, res) {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const tokenVerified = await jwtVerifier(token);
        const data = sanitizeObject(req.body);

        if (tokenVerified || !token) {
            return res.status(401).send({ error: "Unauthorized" });
        }

        const { error, value } = validateClientData(data);
        if (error) {
            return res.status(400).send({ error: "Invalid data provided" });
        }

        await addClient(value);
        res.status(201).send("Client created successfully!");
    } catch (error) {
        logger.error("Error creating Client: " + error.message || error);
        res.status(500).send({ error: "Error creating Client" });
    }
}

function validateClientData(data) {
    const schema = Joi.object({
        company: Joi.string().min(3).max(101).required(),
        email: Joi.string().min(3).max(101).required(),
        industry: Joi.string().min(3).max(101).required(),
        otherUserInfo: Joi.object({
            Name: Joi.string().min(3).max(101).required(),
            Phone: Joi.string().min(3).max(101).required(),
            Address: Joi.string().min(3).max(101).required()
        }),
    });
 
    return schema.validate(data);
}

async function addClient(data) {
    const { company, email, industry, otherUserInfo } = data;
    
    try {
        await runTransaction(db, async (transaction) => {
            const newCount = await incrementClientCounter(transaction);
            const clientID = 'CLT' + String(newCount).padStart(8, '0');
            await addDoc(collection(db, "clients"), {
                email, role: "Client", clientID,
                company, industry, joinDate: serverTimestamp(),
                otherUserInfo
            }, { transaction });
        });
    } catch (e) {
        throw new Error(e.message);
    }
}

async function incrementClientCounter(transaction) {
    const counterRef = doc(db, "clients", "clientIDCounter");
    const counterDoc = await transaction.get(counterRef);

    let newCount;
    if (counterDoc.exists()) {
        newCount = counterDoc.data().count + 1;
        transaction.update(counterRef, { count: newCount });
    } else {
        newCount = 1;
        transaction.set(counterRef, { count: 1 });
    }

    return newCount;
}

export default createClient;