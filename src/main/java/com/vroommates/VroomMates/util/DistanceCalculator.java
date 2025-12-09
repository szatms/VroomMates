package com.vroommates.VroomMates.util;

import org.json.JSONObject;
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public class DistanceCalculator {

    private static Double getRouteDistanceFromORS(double lat1, double lon1, double lat2, double lon2)
            throws IOException, InterruptedException {

        String apiKey = "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImFjYjQ2MDcxZmU1NzQxMWE5MGE3NGQwYWZhMTM5ZDhlIiwiaCI6Im11cm11cjY0In0=";

        String body = String.format("""
        {
          "coordinates": [
            [%f, %f],
            [%f, %f]
          ]
        }
        """, lon1, lat1, lon2, lat2);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://api.openrouteservice.org/v2/directions/driving-car"))
                .header("Content-Type", "application/json")
                .header("Authorization", apiKey)
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .build();

        HttpClient client = HttpClient.newHttpClient();
        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        System.out.println("=== ORS RAW RESPONSE START ===");
        System.out.println("Status: " + response.statusCode());
        System.out.println("Body: " + response.body());
        System.out.println("=== ORS RAW RESPONSE END ===");

        if (response.statusCode() != 200) {
            System.out.println("ORS error: status " + response.statusCode());
            return null;
        }

        JSONObject json = new JSONObject(response.body());

        // ÚJ STRUKTÚRA: routes → summary → distance
        if (!json.has("routes")) {
            System.out.println("ORS JSON missing 'routes' → fallback.");
            return null;
        }

        double meters = json.getJSONArray("routes")
                .getJSONObject(0)
                .getJSONObject("summary")
                .getDouble("distance");

        return meters / 1000.0; // m → km
    }

    // Egyszerű fallback távolság
    public static double haversine(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);

        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }


    // Betekerő metódus
    public static double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        try {
            System.out.println("Trying ORS route calculation...");

            Double routeDistance = getRouteDistanceFromORS(lat1, lon1, lat2, lon2);

            if (routeDistance != null) {
                System.out.println("✔ ORS API used. Route distance: " + routeDistance + " km");
                return routeDistance;
            }
        } catch (Exception e) {
            System.out.println("❌ ORS API error → " + e.getMessage());
        }

        System.out.println("ℹ Fallback to Haversine");
        return haversine(lat1, lon1, lat2, lon2);
    }
}
