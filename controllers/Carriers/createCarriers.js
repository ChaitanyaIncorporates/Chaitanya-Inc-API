import Joi from "joi";
import app from "../../firebase.js";
import jwtVerifier from '../../Security/jwtVerifier.js'
import { sanitizeObject } from "../../Security/Sanitization.js";
import { requestLogger as logger } from "../../Security/logger.js";
import { getFirestore, collection, addDoc, doc, serverTimestamp } from "firebase/firestore";

const db = getFirestore(app);

async function createCarrier(req, res) {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const tokenVerified = await jwtVerifier(token);

        if (tokenVerified || !token) {
            return res.status(401).send({ error: "Unauthorized" });
        }

        const { error, value } = validateCarrier(req.body);
        if (error) {
            return res.status(400).send({ error: "Invalid data provided" });
        }

        await addCarrier(sanitizeObject(value));
        res.status(201).send("Job Position created successfully!");
    } catch (error) {
        logger.error("Error creating Job: " + error.message || error);
        res.status(500).send({ error: "Internal server error" });
    }
}

function validateCarrier(data) {
    const schema = Joi.object({
        title: Joi.string().min(3).max(255).required(),
        sub_title: Joi.string().min(3).max(255).required(),
        location: Joi.string().min(3).max(255).required(),
        department: Joi.string().min(3).max(51).required(),
        sub_description: Joi.string().min(3).required(),
        posted_by: Joi.string().min(3).max(28).required(),
        description: Joi.object({
            main_body: Joi.array().items(Joi.string().min(3).required()),
            work: Joi.array().items(Joi.string().min(3).required()),
            skills: Joi.string().min(3).required(),
            amenities: Joi.array().items(Joi.string().min(3).required()),
        }),
    });

    return schema.validate(data);
}

async function addCarrier(data) {
    const { title, sub_title, location, department, sub_description, posted_by, description } = data;

    try {
        const carrierRef = collection(db, "carriers");
        const carrier = await addDoc(carrierRef, {
            title, sub_title, location, posted_date: serverTimestamp(), 
            description, department, sub_description, 
            posted_by: doc(db, 'users', posted_by)
        });
        logger.info("Carrier created with ID:" + carrier.id);
    } catch (e) {
        throw new Error("Failed to create carrier");
    }
};

export default createCarrier;