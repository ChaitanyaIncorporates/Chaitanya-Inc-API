import jwt from "jsonwebtoken";
import { getFirestore, } from "firebase/firestore";
import app from "../../firebase.js";

const db = getFirestore(app);

async function getUsers(req, res) {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

        if (!decodedToken) {
            return res.status(401).send({ error: "Unauthorized access" });
        }

        const userData = await getDocUsers();
        res.status(201).send(userData);
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).send({ error: "Error fetching user" });
    }
}

async function getDocUsers(id) {
    const querySnapshot = await getDocs(collection(db, "users"));
    const users = [];

    querySnapshot.forEach(doc => { users.push({ id: doc.id, data: doc.data() }); });
    return users;
}

export default getUsers;