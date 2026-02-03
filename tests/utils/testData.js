/**
 * Test Data Utilities
 * Provides test data generators and constants for RapiXchange tests
 */

/**
 * Generates a random email address
 * @param {string} prefix - Optional prefix for the email
 * @returns {string} Random email address
 */
export function generateRandomEmail(prefix = 'test') {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `${prefix}_${timestamp}_${random}@example.com`;
}

/**
 * Generates a random full name
 * @returns {string} Random full name
 */
export function generateRandomName() {
    const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'Robert', 'Lisa'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis'];

    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];

    return `${firstName} ${lastName}`;
}

/**
 * Generates a random phone number
 * @returns {string} Random phone number
 */
export function generateRandomPhone() {
    const areaCode = Math.floor(Math.random() * 900) + 100;
    const firstPart = Math.floor(Math.random() * 900) + 100;
    const secondPart = Math.floor(Math.random() * 9000) + 1000;

    return `${areaCode}${firstPart}${secondPart}`;
}

/**
 * Generates a strong password
 * @returns {string} Strong password
 */
export function generateStrongPassword() {
    const length = 12;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';

    for (let i = 0; i < length; i++) {
        password += charset.charAt(Math.floor(Math.random() * charset.length));
    }

    return password;
}

/**
 * Provided test credentials for manual/real testing
 */
export const providedCredentials = {
    email: 'Antier1@yopmail.com',
    password: 'Admin@123',
    pin: '111111'
};

/**
 * Valid test user data for signup tests
 */
export const validUserData = {
    accountType: 'User',
    fullName: 'Test User',
    email: generateRandomEmail('user'),
    password: 'Test@123456',
    phone: '1234567890',
    referralCode: 'TEST123'
};

/**
 * Valid test agent data
 */
export const validAgentData = {
    accountType: 'Agent',
    fullName: 'Test Agent',
    email: generateRandomEmail('agent'),
    password: 'Agent@123456',
    phone: '9876543210',
    referralCode: 'AGENT123'
};

/**
 * Invalid email formats for testing
 */
export const invalidEmails = [
    'invalid-email',
    'test@',
    '@example.com',
    'test..test@example.com',
    'test@example',
    'test @example.com',
    'test@.com',
    ''
];

/**
 * Invalid password scenarios
 */
export const invalidPasswords = {
    tooShort: '123',
    noSpecialChar: 'Password123',
    noNumber: 'Password@@@',
    noUpperCase: 'password@123',
    empty: ''
};

/**
 * SQL Injection test strings
 */
export const sqlInjectionStrings = [
    "' OR '1'='1",
    "admin'--",
    "' OR 1=1--",
    "1' UNION SELECT NULL--"
];

/**
 * XSS test strings
 */
export const xssStrings = [
    '<script>alert("XSS")</script>',
    '<img src=x onerror=alert("XSS")>',
    'javascript:alert("XSS")',
    '<svg onload=alert("XSS")>'
];

/**
 * Special characters for name field testing
 */
export const specialCharacters = [
    '!@#$%^&*()',
    '<>?/\\|',
    '12345',
    'Test123!@#'
];

/**
 * Generate complete valid user signup data
 * @param {string} prefix - Optional prefix for email
 * @returns {Object} Complete user data object
 */
export function generateValidUserData(prefix = 'user') {
    const password = generateStrongPassword();
    return {
        accountType: 'User',
        fullName: generateRandomName(),
        email: generateRandomEmail(prefix),
        password: password,
        confirmPassword: password,
        phone: generateRandomPhone(),
        referralCode: 'REF' + Math.floor(Math.random() * 10000)
    };
}

/**
 * Generate complete valid agent signup data
 * @param {string} prefix - Optional prefix for email
 * @returns {Object} Complete agent data object
 */
export function generateValidAgentData(prefix = 'agent') {
    const password = generateStrongPassword();
    return {
        accountType: 'Agent',
        fullName: generateRandomName(),
        email: generateRandomEmail(prefix),
        password: password,
        confirmPassword: password,
        phone: generateRandomPhone(),
        referralCode: 'AGENT' + Math.floor(Math.random() * 10000)
    };
}

/**
 * Generate login credentials
 * @param {string} accountType - 'User' or 'Agent'
 * @returns {Object} Login credentials object
 */
export function generateLoginCredentials(accountType = 'User') {
    return {
        email: generateRandomEmail(accountType.toLowerCase()),
        password: generateStrongPassword(),
        accountType: accountType
    };
}
