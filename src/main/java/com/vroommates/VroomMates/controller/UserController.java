package com.vroommates.VroomMates.controller;


import com.vroommates.VroomMates.model.usermodel.User;
import com.vroommates.VroomMates.model.usermodel.UserRepository;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.List;

@RestController
public class UserController {
    private static final Logger logger = LoggerFactory.getLogger(UserController.class);
    @Autowired
    private UserRepository userRepository;
@GetMapping("/getusers")
List<User> getUsers() {
    List<User> users = userRepository.findAll();

    // 2. Naplózás hozzáadása a visszatérés előtt:
    logger.info("ADATBÁZISBÓL KIOLVASOTT ADATOK: {}", users);

    return users;
    }
}