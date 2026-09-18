/**
 * Generates an array of financial year options from a start year up to the current year.
 * @param {number} startYear - The starting year (default is 2015).
 * @returns {Array} Array of financial year objects.
 */
export const generateFinancialYears = (startYear = 2015) => {
    const currentYear = new Date().getFullYear();
    const years = [];

    for (let y = startYear; y <= currentYear; y++) {
        const nextYearShort = String(y + 1).slice(-2);
        years.push({
            value: `${y}-${y + 1}`,
            label: `${y}-${nextYearShort}`,
            startYear: y,
            endYear: y + 1
        });
    }
    // Return in reverse chronological order (latest year first)
    return years.reverse();
};

/**
 * Gets the current active financial year based on the current date (assuming April start).
 * @param {Array} options - The pre-generated list of financial years.
 * @returns {Object} The default financial year object.
 */
export const getDefaultFinancialYear = (options = generateFinancialYears()) => {
    const now = new Date();
    const currentYear = now.getFullYear();
    // Assuming financial year starts in April (Month index 3)
    const targetYear = now.getMonth() >= 3 ? currentYear : currentYear - 1;

    return options.find(item => item.startYear === targetYear) || options[0];
};