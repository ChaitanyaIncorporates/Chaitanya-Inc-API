import Joi from "joi";
import app from "../../firebase.js";
import jwtVerifier from "../../Security/jwtVerifier.js";
import { sanitizeObject } from "../../Security/Sanitization.js";
import { requestLogger as logger } from '../../Security/logger.js';
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { Timestamp, collection, doc, getFirestore, runTransaction} from "firebase/firestore";

const db = getFirestore(app);
const auth = getAuth(app);

async function registerUser(req, res) {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const tokenVerified = await jwtVerifier(token);

        if (tokenVerified || !token) {
            return res.status(401).send({ error: "Unauthorized" });
        }

        const { value, error } = validateAndSanitize(sanitizeObject(req.body));
        if (error) {
            return res.status(400).send({ error: "Invalid data provided" });
        }

        await addUser(value);
        res.status(201).send({ message: 'User created successfully' });
    } catch (error) {
        logger.error("Error registering user:" + error.message || error);
        res.status(500).send({ error: "Error registering user" });
    }
}

async function addUser(data) {
    const { email, password, OtherUserInfo, EmployeeDetails } = data;

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await runTransaction(db, async (transaction) => {
            const EmployeeID = await generateUniqueEmployeeID(transaction);
            await transaction.set(doc(collection(db, "users"), user.uid), {
                uid: user.uid,
                username: generateUsername(email),
                email,
                role: "Employee",
                OtherUserInfo,
                EmployeeDetails: {
                    ...EmployeeDetails,
                    EmployeeID,
                    HireDate: Timestamp.now()
                }
            });
        });

        logger.info("Document written for user:", user.uid);
    } catch (error) {
        throw new Error(error);
    }
}

function validateAndSanitize(userData) {
    const schema = Joi.object({
        email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net', 'org'] } }).required(),
        password: Joi.string().min(8).required(),
        OtherUserInfo: Joi.object({
            Name: Joi.string().min(3).max(50),
            Phone: Joi.string().pattern(/^\+\d{1,14}$/),
            Address: Joi.string().min(3).max(50)
        }),
        EmployeeDetails: Joi.object({
            Department: Joi.string().min(2).max(50),
            JobTitle: Joi.string().min(2).max(50),
        })
    });

    return schema.validate(userData);
}

function generateUsername(email, maxLength = 20) {
    const username = email.substring(0, email.indexOf('@'));
    const cleanUsername = username.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const truncatedUsername = cleanUsername.substring(0, maxLength);
    return truncatedUsername;
}

async function generateUniqueEmployeeID(transaction) {
    const counterRef = doc(db, "users", "clientIDCounter");
    const counterDoc = await transaction.get(counterRef);

    let newCount;
    if (counterDoc.exists()) {
        newCount = counterDoc.data().count + 1;
        transaction.update(counterRef, { count: newCount });
    } else {
        newCount = 1;
        transaction.set(counterRef, { count: 1 });
    }
    const clientID = 'EMP' + String(newCount).padStart(8, '0');
    return clientID;
}

export default registerUser;
