const validatePassword = (password) => {
    const errors = [];

    if (!password) {
        errors.push("Password is required");
        return errors;
    }

    if (password.length < 8) {
        errors.push("Password must be at least 8 characters");
    }

    if (!/[A-Z]/.test(password)) {
        errors.push("Password must contain at least 1 uppercase letter");
    }

    if (!/[a-z]/.test(password)) {
        errors.push("Password must contain at least 1 lowercase letter");
    }

    if (!/[0-9]/.test(password)) {
        errors.push("Password must contain at least 1 number");
    }

    if (!/[!@#$%^&*(),.?":{}|<>_\-\\[\]\/+=;']/.test(password)) {
        errors.push("Password must contain at least 1 special character");
    }

    return errors;
};

module.exports = validatePassword;