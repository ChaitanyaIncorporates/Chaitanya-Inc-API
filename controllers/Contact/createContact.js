import Joi from "joi";
import app from "../../firebase.js";
import { getFirestore } from "firebase/firestore";
import { collection, addDoc } from "firebase/firestore";
import jwtVerifier from "../../Security/jwtVerifier.js";
import { sanitizeObject, sanitizeString } from "../../Security/Sanitization.js";
import { requestLogger as logger } from "../../Security/logger.js";


const db = getFirestore(app);

async function createContact(req, res) {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const tokenVerified = await jwtVerifier(token);

        if (tokenVerified) {
            return res.status(401).send({ error: `Unauthorized: ${tokenVerified}` });
        }

        const userData = await addContact(sanitizeObject(req.body));
        res.status(201).send(`Contact added successfully: ${userData}`);
    } catch (error) {
        console.error("Error registering user:", error);
    }
}


async function addContact(data) {
    const schema = Joi.object({
        first_name: Joi.string().min(3).max(30).required(),
        last_name: Joi.string().min(3).max(30).required(),
        email: Joi.string().email().required(),
        phone_no: Joi.string().min(10).max(10).required(),
        message: Joi.string().min(3).max(100).required(),
        region: Joi.string().min(3).max(3).required(),
        company: Joi.string().min(3).max(38).required(),
    });
    
    const { error } = schema.validate(data);
    if (error) throw new Error(error.details[0].message);
    const { first_name, last_name, email, phone_no, message, region, company } = data;

    try {
        await addDoc(collection(db, "contact"), {
            first_name, last_name, email, 
            phone_no, message, region, company
        });
        return data.email;
    } catch (e) {
        throw new Error(`Error adding user to database: ${e}`);
    }
}

export default createContact;