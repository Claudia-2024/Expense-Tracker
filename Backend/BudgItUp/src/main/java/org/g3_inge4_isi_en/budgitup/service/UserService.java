package org.g3_inge4_isi_en.budgitup.service;

import lombok.RequiredArgsConstructor;
import org.g3_inge4_isi_en.budgitup.dto.AuthRequest;
import org.g3_inge4_isi_en.budgitup.dto.AuthResponse;
import org.g3_inge4_isi_en.budgitup.entity.Category;
import org.g3_inge4_isi_en.budgitup.entity.User;
import org.g3_inge4_isi_en.budgitup.repository.CategoryRepository;
import org.g3_inge4_isi_en.budgitup.repository.UserRepository;
import org.g3_inge4_isi_en.budgitup.security.JwtUtil;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityNotFoundException;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final JwtUtil jwtUtil;
    private final BCryptPasswordEncoder passwordEncoder;

    @Transactional
    public AuthResponse register(AuthRequest req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new IllegalArgumentException("Email already registered");
        }

        List<Long> chosenIds = req.getDefaultCategoryIds();
        if (chosenIds == null || chosenIds.isEmpty()) {
            throw new IllegalArgumentException("You must choose at least one default category");
        }

        User user = User.builder()
                .email(req.getEmail())
                .passwordHash(passwordEncoder.encode(req.getPassword()))
                .defaultCurrency("XAF")
                .hasCompletedOnboarding(false)
                .tokenVersion(0)
                .build();

        user = userRepository.save(user);

        // fetch defaults, validate, create user-owned copies
        List<Category> defaults = categoryRepository.findAllById(chosenIds);
        if (defaults.size() != chosenIds.size()) {
            throw new IllegalArgumentException("Some category IDs are invalid");
        }
        List<Category> nonDefaults = defaults.stream().filter(d -> !d.isDefault()).collect(Collectors.toList());
        if (!nonDefaults.isEmpty()) throw new IllegalArgumentException("All chosen categories must be default categories");

        User finalUser = user;
        List<Category> userCats = defaults.stream()
                .map(sys -> Category.builder()
                        .name(sys.getName())
                        .color(sys.getColor())
                        .isDefault(false)
                        .user(finalUser)
                        .build())
                .collect(Collectors.toList());
        categoryRepository.saveAll(userCats);

        String token = jwtUtil.generateToken(user.getEmail(), user.getId(), user.getTokenVersion() == null ? 0 : user.getTokenVersion());

        return new AuthResponse(user.getId(), user.getEmail(), user.getDefaultCurrency(), user.isHasCompletedOnboarding(), token);
    }

    public AuthResponse login(AuthRequest req) {
        User user = userRepository.findByEmail(req.getEmail()).orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));
        if (!passwordEncoder.matches(req.getPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid credentials");
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getId(), user.getTokenVersion() == null ? 0 : user.getTokenVersion());

        return new AuthResponse(user.getId(), user.getEmail(), user.getDefaultCurrency(), user.isHasCompletedOnboarding(), token);
    }

    @Transactional
    public void logout(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new EntityNotFoundException("User not found"));
        Integer v = user.getTokenVersion();
        if (v == null) v = 0;
        user.setTokenVersion(v + 1); // increment -> invalidates existing tokens
        userRepository.save(user);
    }

    public User getById(Long id) {
        return userRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("User not found"));
    }
}
