import jwt from 'jsonwebtoken';
import app from '../firebase.js';
import { requestLogger as logger } from './logger.js';
import { doc, getDoc, getFirestore } from 'firebase/firestore';

const ISSUER = "ChaitanyaInc";
const AUTHORIZATION_LEVELS = { DIRECTOR: 0, MANAGER: 1, EMPLOYEE: 2, AUDITOR: 3 };
const db = getFirestore(app);

async function jwtVerifier(token) {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET, { issuer: ISSUER });
        const currentTime = Math.floor(Date.now() / 1000);

        if (decoded.iss !== ISSUER) {
            return 'Invalid issuer';
        } if (decoded.iat > currentTime || currentTime > decoded.exp) {
            return 'Token has expired';
        } if (decoded.critical !== undefined) {
            if (decoded.critical >= 0 && decoded.critical <= Object.values(AUTHORIZATION_LEVELS).length - 1) {
                const isAuthorized = await checkAuthorizationLevel(decoded.userId, decoded.critical);
                if (!isAuthorized) {
                    throw new Error('Unauthorized access level');
                }
            } else {
                return true;
            }
        }
        return false;
    } catch (error) {
        logger.error(`Error in JWT verification: ${error}`);
        return true;
    }
}

async function checkAuthorizationLevel(userId, criticalLevel) {
    try {
        const userRole = await getUserRole(userId);
        if (!userRole || !AUTHORIZATION_LEVELS[userRole]) {
            throw new Error('Invalid user role');
        }
        return criticalLevel <= AUTHORIZATION_LEVELS[userRole];
    } catch (error) {
        logger.error(`Error checking authorization level: ${error.message}`);
        throw new Error(`Error checking authorization level: ${error.message}`);
    }
}

async function getUserRole(userId) {
    try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
            return userDoc.data().role;
        } else {
            throw new Error('User does not exist');
        }
    } catch (error) {
        logger.error(`Error fetching user role: ${error.message}`);
        throw new Error(`Error fetching user role: ${error.message}`);
    }
}

export default jwtVerifier;