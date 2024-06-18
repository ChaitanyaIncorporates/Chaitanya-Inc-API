import Joi from "joi";
import app from "../../firebase.js";
import jwtVerifier from "../../Security/jwtVerifier.js";
import { sanitizeObject } from "../../Security/Sanitization.js";
import { requestLogger as logger } from "../../Security/logger.js";
import { getFirestore, serverTimestamp, collection, addDoc } from "firebase/firestore";

const db = getFirestore(app);

async function createContact(req, res) {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const tokenVerified = await jwtVerifier(token);

        if (tokenVerified || !token) {
            return res.status(401).send({ error: "Unauthorized access" });
        }

        const { value, error } = validateContact(sanitizeObject(req.body));
        if (error) {
            return res.status(400).send({ error: "Invalid data provided" });
        }
        
        await addContact(value);
        res.status(201).send(`Contact added successfully: ${value.email}`);
    } catch (error) {
        logger.error("Error registering Querry: " + error.message || error);
        res.status(500).send({ error: "Error registering Querry" });
    }
}

function validateContact(data) {
    const schema = Joi.object({
        first_name: Joi.string().min(3).max(30).required(),
        last_name: Joi.string().min(3).max(30).required(),
        email: Joi.string().email().required(),
        phone_no: Joi.string().min(10).max(10).required(),
        message: Joi.string().min(3).max(100).required(),
        region: Joi.string().min(3).max(3).required(),
        company: Joi.string().min(3).max(38).required(),
    });
    
    return schema.validate(data);
}

async function addContact(data) {
    try {
        await addDoc(collection(db, "contact"), { ...data, timestamp: serverTimestamp()});
    } catch (e) {
        throw new Error(`Error adding user to database: ${e}`);
    }
}

export default createContact;