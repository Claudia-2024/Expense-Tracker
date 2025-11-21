package org.g3_inge4_isi_en.budgitup.controller;

import lombok.RequiredArgsConstructor;
import org.g3_inge4_isi_en.budgitup.dto.AuthRequest;
import org.g3_inge4_isi_en.budgitup.dto.AuthResponse;
import org.g3_inge4_isi_en.budgitup.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody AuthRequest request) {
        return ResponseEntity.ok(userService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest request) {
        return ResponseEntity.ok(userService.login(request));
    }

    /**
     * Logout: client should call this endpoint and then delete token locally.
     * This increments the user's tokenVersion, invalidating existing tokens.
     *
     * Example: POST /api/auth/logout with body {"userId": 1}
     */
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@RequestParam Long userId) {
        userService.logout(userId);
        return ResponseEntity.ok().build();
    }
}
