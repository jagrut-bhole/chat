const EARTH_RADIUS_KM = 6371;

function toRadians(deg: number): number {
    return deg * Math.PI / 180;
}

export function getDistanceInKm(lat1: number, long1: number, lat2: number, long2: number) {
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(long2 - long1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return EARTH_RADIUS_KM * c;
}
