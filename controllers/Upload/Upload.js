import jwt from 'jsonwebtoken';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const storage = getStorage();
const storageRef = ref(storage, 'Resume');

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

async function uploadPDF(req, res) {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const data = decodedToken.user;

        const downloadLink = await addPDF(data);
        res.status(201).send({ message: "Uploaded successfully", downloadLink });
    } catch (error) {
        console.error("Error uploading PDF:", error);
        res.status(500).send({ error: "Error uploading PDF" });
    }
}

async function addPDF(data) {
    const { pdf } = data;
    try {
        const pdfBuffer = Buffer.from(pdf, 'base64');
        const pdfId = generateToken(10);
        const file = ref(storageRef, pdfId);
        await uploadBytes(file, pdfBuffer, {
            metadata: {
                contentType: 'application/pdf',
            },
        });

        const downloadURL = await getDownloadURL(file);
        return downloadURL;
    } catch (error) {
        console.error("Error adding PDF:", error);
        throw error;
    }
}

export default uploadPDF;