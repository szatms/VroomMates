package com.vroommates.VroomMates.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class RoleTestController {

    @GetMapping("/admin/test")
    public ResponseEntity<String> adminOnly() {
        return ResponseEntity.ok("ADMIN ENDPOINT WORKS");
    }

    @GetMapping("/driver/test")
    public ResponseEntity<String> driverOnly() {
        return ResponseEntity.ok("DRIVER ENDPOINT WORKS");
    }

    @GetMapping("/user/test")
    public ResponseEntity<String> userOnly() {
        return ResponseEntity.ok("USER ENDPOINT WORKS");
    }
}
