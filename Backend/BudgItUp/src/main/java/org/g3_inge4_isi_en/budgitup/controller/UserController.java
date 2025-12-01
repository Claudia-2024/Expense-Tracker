package org.g3_inge4_isi_en.budgitup.controller;

import lombok.RequiredArgsConstructor;
import org.g3_inge4_isi_en.budgitup.dto.DashboardStatsDto;
import org.g3_inge4_isi_en.budgitup.dto.UserProfileDto;
import org.g3_inge4_isi_en.budgitup.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/{userId}/profile")
    public ResponseEntity<UserProfileDto> getUserProfile(@PathVariable Long userId) {
        return ResponseEntity.ok(userService.getUserProfile(userId));
    }

    @PutMapping("/{userId}/profile")
    public ResponseEntity<UserProfileDto> updateUserProfile(
            @PathVariable Long userId,
            @RequestBody UserProfileDto profileDto) {
        return ResponseEntity.ok(userService.updateUserProfile(userId, profileDto));
    }

    @GetMapping("/{userId}/stats")
    public ResponseEntity<DashboardStatsDto> getDashboardStats(@PathVariable Long userId) {
        return ResponseEntity.ok(userService.getDashboardStats(userId));
    }
}