import DOMPurify from 'isomorphic-dompurify';

function sanitizeString(inputString) {
    if (typeof inputString !== 'string') {
        throw new Error('Input must be a string');
    }
    return DOMPurify.sanitize(inputString);
}

function sanitizeObject(inputObject) {
    if (typeof inputObject !== 'object' || inputObject === null) {
        return inputObject;
    }

    if (Array.isArray(inputObject)) {
        return inputObject.map((item) => sanitizeObject(item));
    }

    const sanitizedObject = {};
    Object.keys(inputObject).forEach((key) => {
        if (typeof inputObject[key] === 'string') {
            sanitizedObject[key] = DOMPurify.sanitize(inputObject[key]);
        } else if (typeof inputObject[key] === 'object') {
            sanitizedObject[key] = sanitizeObject(inputObject[key]);
        } else {
            sanitizedObject[key] = inputObject[key];
        }
    });

    return sanitizedObject;
}

export { sanitizeString, sanitizeObject };