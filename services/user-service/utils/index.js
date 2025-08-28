function isValidDate(val) {
    return !isNaN(Date.parse(val));
}

function validateUserUpdate(body) {
    const allowedFields = {
        nickname: val => typeof val === 'string',
        gender: val => typeof val === 'string' && ['Male', 'Female', 'Other', ''].includes(val), // Added gender
        avatarType: val => typeof val === 'string',
        avatarUrl: val => typeof val === 'string',
        languages: val => Array.isArray(val) && val.every(item => typeof item === 'string'),
        interests: val => Array.isArray(val) && val.every(item => typeof item === 'string'),
        region: val => typeof val === 'string', // keep or remove based on schema decision
        subscription: val =>
            typeof val === 'object' &&
            val !== null &&
            (val.tier === undefined || ['free', 'pro', 'premium'].includes(val.tier)) &&
            (val.expiresAt === undefined || isValidDate(val.expiresAt)),
        limits: val =>
            typeof val === 'object' &&
            val !== null &&
            (val.dailyCalls === undefined || typeof val.dailyCalls === 'number') &&
            (val.lastReset === undefined || isValidDate(val.lastReset)),
        flags: val =>
            typeof val === 'object' &&
            val !== null &&
            (val.banned === undefined || typeof val.banned === 'boolean') &&
            (val.shadow === undefined || typeof val.shadow === 'boolean'),
    };

    const updateBody = {};
    const errors = [];

    for (const key in body) {
        const value = body[key];

        if (!(key in allowedFields)) {
            errors.push({ field: key, message: 'Field not allowed' });
            continue;
        }

        const isValid = allowedFields[key](value);

        if (!isValid) {
            errors.push({ field: key, message: 'Invalid type or structure' });
        } else {
            updateBody[key] = value;
        }
    }

    return {
        valid: errors.length === 0,
        data: updateBody,
        errors
    };
}

module.exports = { validateUserUpdate };
