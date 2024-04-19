import Joi from "joi";
import app from "../../firebase.js";
import jwtVerifier from "../../Security/jwtVerifier.js";
import { sanitizeObject } from "../../Security/Sanitization.js";
import { requestLogger as logger } from '../../Security/logger.js';
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { Timestamp, doc, getFirestore, setDoc, collection, getDocs, getCountFromServer } from "firebase/firestore";

const db = getFirestore(app);
const auth = getAuth(app);

async function registerUser(req, res) {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const tokenVerified = await jwtVerifier(token);

        if (tokenVerified) {
            return res.status(401).send({ error: `UnAuthorized: ${tokenVerified}` });
        }

        const userData = validateAndSanitize(req.body);
        await addUser(userData);

        res.status(201).send({ message: 'User created successfully' });
    } catch (error) {
        logger.error("Error registering user:", error);
        res.status(500).send({ error: "Error registering user" });
    }
}

async function addUser(data) {
    const { email, password, OtherUserInfo, EmployeeDetails } = data;

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await setDoc(doc(db, "users", user.uid), {
            uid: user.uid,
            username: generateUsername(email),
            email,
            role: "Employee",
            OtherUserInfo,
            EmployeeDetails: {
                ...EmployeeDetails,
                EmployeeID: await generateUniqueEmployeeID(),
                HireDate: Timestamp.now()
            }
        });

        logger.info("Document written for user:", user.uid);
    } catch (error) {
        logger.error("Error adding user:", error);
        throw error;
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

    const { error, value } = schema.validate(userData);
    if (error) throw new Error(error.details[0].message);
    
    return sanitizeObject(value);
}

function generateUsername(email, maxLength = 20) {
    const username = email.substring(0, email.indexOf('@'));
    const cleanUsername = username.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const truncatedUsername = cleanUsername.substring(0, maxLength);
    return truncatedUsername;
}

async function generateUniqueEmployeeID() {
    const querySnapshot = await getCountFromServer(collection(db, "users"));
    const employeeID = 'EMP' + String(querySnapshot.data().count + 1).padStart(8, '0');
    return employeeID;
}

export default registerUser;
