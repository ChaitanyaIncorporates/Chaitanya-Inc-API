import Joi from "joi";
import app from "../../firebase.js";
import jwtVerifier from '../../Security/jwtVerifier.js'
import { sanitizeObject } from "../../Security/Sanitization.js";
import { requestLogger as logger } from "../../Security/logger.js";
import { getFirestore, collection, addDoc, doc } from "firebase/firestore";

const db = getFirestore(app);

async function createCarrier(req, res) {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const tokenVerified = await jwtVerifier(token);

        if (tokenVerified) {
            return res.status(401).send({ error: `Unauthorized: ${tokenVerified}` });
        }

        const { error, value } = validateCarrier(req.body);
        if (error) {
            return res.status(400).send({ error: error.details[0].message });
        }

        await addCarrier(sanitizeObject(value));
        res.status(201).send("Job Position created successfully!");
    } catch (error) {
        logger.error("Error creating Job:", error);
        res.status(500).send({ error: "Error creating Job" });
    }
}

function validateCarrier(data) {
    const schema = Joi.object({
        title: Joi.string().min(3).max(255).required(),
        sub_title: Joi.string().min(3).max(255).required(),
        location: Joi.string().min(3).max(255).required(),
        posted_date: Joi.date().required(),
        department: Joi.string().min(3).required(),
        sub_description: Joi.string().min(3).required(),
        posted_by: Joi.string().max(28).required(),
        description: Joi.object({
            main_body: Joi.string().min(3).required(),
            work: Joi.string().min(3).required(),
            skills: Joi.string().min(3).required(),
            amenities: Joi.string().min(3).required(),
        }),
    });

    return schema.validate(data);
}

async function addCarrier(data) {
    const { title, sub_title, location, posted_date, department, sub_description, posted_by, description } = data;

    try {
        const carrierRef = collection(db, "carriers");
        const carrier = await addDoc(carrierRef, {
            title, sub_title, location, posted_date, 
            description, department, sub_description, 
            posted_by: doc(db, 'users', posted_by)
        });
        logger.info("Carrier created with ID:", carrier.id);
    } catch (e) {
        throw new Error(e.message);
    }
};

export default createCarrier;