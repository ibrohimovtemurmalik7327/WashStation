const isExpired = (ticket) => {
    if (!ticket?.expires_at) return true;
    return new Date(ticket.expires_at).getTime() <= Date.now();
};

const attemptsLeft = (ticket) => {
    const attempts = Number(ticket?.attempts ?? 0);
    const max = Number(ticket?.max_attempts ?? 5);
    return Math.max(0, max - attempts);
};

module.exports = { isExpired, attemptsLeft };