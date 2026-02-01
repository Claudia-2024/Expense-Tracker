export const createDateWithCurrentTime = (dateString: string): Date => {
    const [year, month, day] = dateString.split('-').map(Number);
    const now = new Date();

    return new Date(
        year,
        month - 1, // Month is 0-indexed
        day,
        now.getHours(),
        now.getMinutes(),
        now.getSeconds()
    );
};

/**
 * Creates a Date object from a date string (YYYY-MM-DD) at midnight local time
 */
export const createDateAtMidnight = (dateString: string): Date => {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day, 0, 0, 0);
};

/**
 * Formats a date to show "Today", "Yesterday", or the date with time
 */
export const formatTransactionDate = (dateString?: string, timestamp?: number): string => {
    let dateObj: Date;

    if (dateString) {
        // Create date with current time to avoid timezone issues
        dateObj = createDateWithCurrentTime(dateString);
    } else if (timestamp) {
        dateObj = new Date(timestamp);
    } else {
        dateObj = new Date();
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const compareDate = new Date(dateObj);
    compareDate.setHours(0, 0, 0, 0);

    const timeStr = dateObj.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });

    if (compareDate.getTime() === today.getTime()) {
        return `Today, ${timeStr}`;
    } else if (compareDate.getTime() === yesterday.getTime()) {
        return `Yesterday, ${timeStr}`;
    } else {
        return `${dateObj.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        })}, ${timeStr}`;
    }
};
