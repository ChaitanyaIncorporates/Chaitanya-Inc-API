import Joi from "joi";
import app from "../../firebase.js";
import jwtVerifier from "../../Security/jwtVerifier.js";
import { sanitizeObject, sanitizeString } from "../../Security/Sanitization.js";
import { requestLogger as logger } from "../../Security/logger.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";

const db = getFirestore(app);

async function createChangeLog(req, res) {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const tokenVerified = await jwtVerifier(token);

        if (tokenVerified) {
            return res.status(401).send({ error: `Unauthorized: ${tokenVerified}` });
        }

        const changeLogData = sanitizeObject(req.body);
        await addChangeLog(changeLogData);
        res.status(201).send("Change log created successfully!");
    } catch (error) {
        logger.error(`Error creating change Log: ${error}`);
        res.status(500).send({ error: "Error creating change log" });
    }
}

async function addChangeLog(data) {
    const schema = Joi.object({
        title: Joi.string().min(3).max(51).required(),
        content: Joi.string().min(3).max(1001).required(),
        user: Joi.string().min(3).max(51).required(),
        user_id: Joi.string().min(3).max(51).required(),
        img_link: Joi.string().min(3).max(1001).required(),
    });

    const { error } = schema.validate(data);
    if (error) {
        throw new Error(error.details[0].message);
    }

    const { title, content, user, user_id, img_link } = data;

    try {
        await addDoc(collection(db, "changeLogs"), {
            title, content, user, user_id, 
            img_link, timestamp: serverTimestamp()
        });
        logger.info(`Change log created successfully for user: ${sanitizeString(user_id)}`);
    } catch (e) {
        throw new Error(e.message);
    }
}

export default createChangeLog;