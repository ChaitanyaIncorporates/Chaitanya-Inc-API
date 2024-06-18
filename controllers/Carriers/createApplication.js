import Joi from "joi";
import app from "../../firebase.js";
import jwtVerifier from "../../Security/jwtVerifier.js";
import { sanitizeString } from "../../Security/Sanitization.js";
import { requestLogger as logger } from '../../Security/logger.js';
import { getFirestore, collection, addDoc } from "firebase/firestore";

const db = getFirestore(app);

async function createApplication(req, res) {
    try {
        const token = req.headers.authorization.split(' ')[1];

        const tokenVerified = await jwtVerifier(token);
        if (!tokenVerified) {
            return res.status(401).send({ error: `Unauthorized: ${tokenVerified}` });
        }

        await addApplication(req.body);
        logger.info("Client created successfully for user: " + req.body.email);
        res.status(201).send("Client created successfully!");
    } catch (error) {
        logger.error("Error creating client:", error);
        res.status(500).send({ error: "Error creating client" });
    }
}

async function addApplication(data) {
    const schema = Joi.object({
        full_name: Joi.string().min(3).max(51).required(),
        email: Joi.string().email().required(),
        date: Joi.date().required(),
        timeZone: Joi.string().required(),
        country: Joi.string().required(),
        otherUserLinks: Joi.object({
            cover_letter: Joi.string().min(3).max(1000).required(),
            portfolio: Joi.string().uri().required(),
            linkedin: Joi.string().uri().required(),
            resume: Joi.string().uri().required()
        }).required()
    });

    const { error } = schema.validate(data);
    if (error) throw new Error(error.details[0].message);

    const { full_name, email, date, timeZone, country, otherUserLinks } = data;
    const acknowledgment_id = generateToken(10);

    try {
        await addDoc(collection(db, "application"), {
            email: sanitizeString(email),
            acknowledgment_id: sanitizeString(acknowledgment_id),
            full_name: sanitizeString(full_name),
            joinDate: sanitizeString(date),
            timeZone: sanitizeString(timeZone),
            country: sanitizeString(country),
            otherUserLinks: {
                cover_letter: sanitizeString(otherUserLinks.cover_letter),
                portfolio: sanitizeString(otherUserLinks.portfolio),
                linkedin: sanitizeString(otherUserLinks.linkedin),
                resume: sanitizeString(otherUserLinks.resume)
            }
        });
    } catch (e) {
        throw new Error(e.message);
    }
}

function generateToken(tokenLength) {
    const alphanumericCharacters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const tokenIdLength = tokenLength || 10;
    let tokenId = '';

    for (let i = 0; i < tokenIdLength; i++) {
        const randomIndex = Math.floor(Math.random() * alphanumericCharacters.length);
        tokenId += alphanumericCharacters[randomIndex];
    }

    return tokenId;
}

export default createApplication;