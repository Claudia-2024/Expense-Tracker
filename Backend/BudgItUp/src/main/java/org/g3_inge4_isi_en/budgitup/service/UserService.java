// Backend/Budgitup/src/main/java/org/g3_inge4_isi_en/budgitup/service/UserService.java
package org.g3_inge4_isi_en.budgitup.service;

import lombok.RequiredArgsConstructor;
import org.g3_inge4_isi_en.budgitup.dto.AuthRequest;
import org.g3_inge4_isi_en.budgitup.dto.AuthResponse;
import org.g3_inge4_isi_en.budgitup.dto.DashboardStatsDto;
import org.g3_inge4_isi_en.budgitup.dto.UserProfileDto;
import org.g3_inge4_isi_en.budgitup.entity.Category;
import org.g3_inge4_isi_en.budgitup.entity.User;
import org.g3_inge4_isi_en.budgitup.repository.CategoryRepository;
import org.g3_inge4_isi_en.budgitup.repository.ExpenseRepository;
import org.g3_inge4_isi_en.budgitup.repository.IncomeRepository;
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
    private final ExpenseRepository expenseRepository;
    private final IncomeRepository incomeRepository;
    private final JwtUtil jwtUtil;
    private final BCryptPasswordEncoder passwordEncoder;

    @Transactional
    public AuthResponse register(AuthRequest req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new IllegalArgumentException("Email already registered");
        }

        if (req.getName() == null || req.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Name is required");
        }

        List<Long> chosenIds = req.getDefaultCategoryIds();
        if (chosenIds == null || chosenIds.isEmpty()) {
            throw new IllegalArgumentException("You must choose at least one default category");
        }

        User user = User.builder()
                .email(req.getEmail())
                .passwordHash(passwordEncoder.encode(req.getPassword()))
                .name(req.getName().trim())
                .phone(req.getPhone())
                .defaultCurrency("XAF")
                .monthlyBudget(0.0)
                .hasCompletedOnboarding(true)
                .tokenVersion(0)
                .build();

        user = userRepository.save(user);

        List<Category> defaults = categoryRepository.findAllById(chosenIds);
        if (defaults.size() != chosenIds.size()) {
            throw new IllegalArgumentException("Some category IDs are invalid");
        }

        List<Category> nonDefaults = defaults.stream()
                .filter(d -> !d.isDefault())
                .collect(Collectors.toList());
        if (!nonDefaults.isEmpty()) {
            throw new IllegalArgumentException("All chosen categories must be default categories");
        }

        User finalUser = user;
        List<Category> userCats = defaults.stream()
                .map(sys -> Category.builder()
                        .name(sys.getName())
                        .color(sys.getColor())
                        .icon(sys.getIcon())
                        .isDefault(true)
                        .user(finalUser)
                        .build())
                .collect(Collectors.toList());

        categoryRepository.saveAll(userCats);

        String token = jwtUtil.generateToken(user.getEmail(), user.getId(), user.getTokenVersion() == null ? 0 : user.getTokenVersion());

        return new AuthResponse(user.getId(), user.getEmail(), user.getDefaultCurrency(), user.isHasCompletedOnboarding(), token);
    }

    public AuthResponse login(AuthRequest req) {
        User user = userRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));

        if (!passwordEncoder.matches(req.getPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid credentials");
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getId(), user.getTokenVersion() == null ? 0 : user.getTokenVersion());

        return new AuthResponse(user.getId(), user.getEmail(), user.getDefaultCurrency(), user.isHasCompletedOnboarding(), token);
    }

    @Transactional
    public void logout(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
        Integer v = user.getTokenVersion();
        if (v == null) v = 0;
        user.setTokenVersion(v + 1);
        userRepository.save(user);
    }

    public User getById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
    }

    public UserProfileDto getUserProfile(Long userId) {
        User user = getById(userId);
        return new UserProfileDto(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getPhone(),
                user.getDefaultCurrency()
        );
    }

    /**
     * Update user profile
     * 🔥 SECURITY: Only allows updating name, phone, and currency
     * Email CANNOT be changed for security reasons
     */
    @Transactional
    public UserProfileDto updateUserProfile(Long userId, UserProfileDto profileDto) {
        User user = getById(userId);

        // ✅ Allow: Update name if provided and not empty
        if (profileDto.getName() != null && !profileDto.getName().trim().isEmpty()) {
            user.setName(profileDto.getName().trim());
        }

        // ✅ Allow: Update phone (can be set to empty string)
        if (profileDto.getPhone() != null) {
            user.setPhone(profileDto.getPhone().trim().isEmpty() ? null : profileDto.getPhone().trim());
        }

        // ✅ Allow: Update default currency if provided
        if (profileDto.getDefaultCurrency() != null && !profileDto.getDefaultCurrency().trim().isEmpty()) {
            String newCurrency = profileDto.getDefaultCurrency().trim().toUpperCase();

            // Validate currency code (optional - add more validation if needed)
            if (newCurrency.length() == 3) {
                user.setDefaultCurrency(newCurrency);
            } else {
                throw new IllegalArgumentException("Invalid currency code. Must be 3 characters (e.g., XAF, USD)");
            }
        }

        // ❌ BLOCK: Email changes are completely ignored
        // Even if profileDto.getEmail() is provided, we don't update it
        // This is intentional for security reasons

        User updated = userRepository.save(user);

        return new UserProfileDto(
                updated.getId(),
                updated.getName(),
                updated.getEmail(), // Always return current email, never updated
                updated.getPhone(),
                updated.getDefaultCurrency()
        );
    }

    public DashboardStatsDto getDashboardStats(Long userId) {
        User user = getById(userId);

        Double totalIncome = user.getMonthlyBudget() != null ? user.getMonthlyBudget() : 0.0;

        Double totalExpenses = expenseRepository.findByUserId(userId).stream()
                .mapToDouble(e -> e.getAmount())
                .sum();

        Double allocatedIncome = incomeRepository.sumCategoryIncomesByUserId(userId);
        if (allocatedIncome == null) allocatedIncome = 0.0;

        Double remainingBudget = totalIncome - totalExpenses;

        return new DashboardStatsDto(totalIncome, totalExpenses, remainingBudget, allocatedIncome);
    }
}