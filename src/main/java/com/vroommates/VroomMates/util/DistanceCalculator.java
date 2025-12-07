package com.vroommates.VroomMates.util;

public class DistanceCalculator {

    private static final int EARTH_RADIUS_KM = 6371;

    // Haversine
    public static double calculateDistance(float startLat, float startLon, float endLat, float endLon) {
        double latDistance = Math.toRadians(endLat - startLat);
        double lonDistance = Math.toRadians(endLon - startLon);

        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(startLat)) * Math.cos(Math.toRadians(endLat))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return EARTH_RADIUS_KM * c; // Távolság km-ben
    }

    // átlagos co2 kibocsátás ~120g/km
    public static int calculateCo2Saved(double distanceKm) {
        return (int) (distanceKm * 120);
    }
}