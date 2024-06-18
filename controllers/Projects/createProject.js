import Joi from "joi";
import app from "../../firebase.js";
import jwtVerifier from "../../Security/jwtVerifier.js";
import { sanitizeObject } from "../../Security/Sanitization.js";
import { requestLogger as logger } from "../../Security/logger.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";

const db = getFirestore(app);

async function createProject(req, res) {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const tokenVerified = await jwtVerifier(token);

        if (tokenVerified) {
            return res.status(401).send({ error: `Unauthorized: ${tokenVerified}` });
        }

        const projectData = sanitizeObject(req.body);
        await validateProject(projectData);
        await addProject(projectData);

        res.status(201).send("Change log created successfully!");
    } catch (error) {
        logger.error(`Error creating change Log: ${error}`);
        res.status(500).send({ error: "Error creating change log" });
    }
} 

async function validateProject(projectData) {
    const schema = Joi.object({
        sub_description: Joi.array().items(
            Joi.object({
                name: Joi.string().required(),
                description: Joi.string().required()
            })
        ).required(),
        results: Joi.array().items(Joi.string().required()).required(),
        challenge: Joi.string().required(),
        solution: Joi.string().required(),
        logo: Joi.string().required(),
        description: Joi.array().items(Joi.string().required()).required(),
        details: Joi.object({
            image: Joi.string().required(),
            title: Joi.string().required(),
            company: Joi.string().required(),
            author: Joi.object({
                name: Joi.string().required(),
                dp: Joi.string().required(),
                position: Joi.string().required()
            }).required()
        }).required()
    });

    const { error } = schema.validate(projectData);
    if (error) {
        throw new Error(`Validation error: ${error.details.map(x => x.message).join(", ")}`);
    }
}


async function addProject(projectData) {
    const project = sanitizeObject(projectData);
    const projectRef = collection(db, "projects");
    await addDoc(projectRef, {
        ...project,
        created_at: serverTimestamp()
    });
}

export default createProject;