// filepath: d:\Project SDP\SDP\eco-lodge\sdp-backend\utils\dateHelpers.js
function calculateNights(checkIn, checkOut) {
    const diffTime = Math.abs(checkOut - checkIn);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}

module.exports = { calculateNights };