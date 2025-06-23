/**
 * Validates if a string is a valid UUID format
 * @param {string} uuid - The UUID string to validate
 * @returns {boolean} - True if valid UUID format, false otherwise
 */
export function isValidUUID(uuid) {
    if (!uuid || typeof uuid !== 'string') {
        return false;
    }
    
    // Check for literal 'undefined' or 'null' strings
    if (uuid === 'undefined' || uuid === 'null') {
        return false;
    }
    
    // UUID v4 format validation
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
}

/**
 * Validates and returns error response for invalid UUID
 * @param {string} id - The ID to validate
 * @param {string} fieldName - Name of the field for error message
 * @returns {object|null} - Error response object or null if valid
 */
export function validateUUID(id, fieldName = 'id') {
    if (!id || id === 'undefined' || id === 'null') {
        return {
            success: false,
            msg: `${fieldName} é obrigatório.`,
            field: fieldName
        };
    }

    if (!isValidUUID(id)) {
        return {
            success: false,
            msg: `Formato de ${fieldName} inválido.`,
            field: fieldName
        };
    }

    return null;
}
