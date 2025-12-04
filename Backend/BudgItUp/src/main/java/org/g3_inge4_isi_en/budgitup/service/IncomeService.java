// Backend/Budgitup/src/main/java/org/g3_inge4_isi_en/budgitup/service/IncomeService.java
// 🔥 FIXED VERSION - Ensures proper user isolation for ALL income operations
package org.g3_inge4_isi_en.budgitup.service;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.g3_inge4_isi_en.budgitup.dto.IncomeDto;
import org.g3_inge4_isi_en.budgitup.entity.Category;
import org.g3_inge4_isi_en.budgitup.entity.Income;
import org.g3_inge4_isi_en.budgitup.entity.User;
import org.g3_inge4_isi_en.budgitup.repository.CategoryRepository;
import org.g3_inge4_isi_en.budgitup.repository.IncomeRepository;
import org.g3_inge4_isi_en.budgitup.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class IncomeService {

    private final IncomeRepository incomeRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;

    /**
     * Add or update income
     * 🔥 CRITICAL FIX: Now properly verifies user ownership for ALL operations
     */
    @Transactional
    public IncomeDto addOrUpdateIncome(Long userId, IncomeDto dto) {
        System.out.println("=== ADD/UPDATE INCOME START ===");
        System.out.println("User ID: " + userId);
        System.out.println("DTO User ID: " + dto.getUserId());
        System.out.println("Amount: " + dto.getAmount());
        System.out.println("Category ID: " + dto.getCategoryId());

        // 🔥 CRITICAL SECURITY CHECK: Verify userId matches dto.getUserId
        if (dto.getUserId() != null && !dto.getUserId().equals(userId)) {
            System.out.println("❌ SECURITY VIOLATION: User " + userId + " attempted to create income for user " + dto.getUserId());
            throw new SecurityException("Cannot create income for another user");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        // CASE 1: Overall Budget (no category selected)
        if (dto.getCategoryId() == null) {
            System.out.println("Processing OVERALL BUDGET income for user " + userId);

            user.setMonthlyBudget(dto.getAmount());
            userRepository.save(user);

            // 🔥 CRITICAL: Use findByUserIdAndCategoryIsNull to ensure proper isolation
            Optional<Income> existingIncome = incomeRepository.findByUserIdAndCategoryIsNull(userId);
            Income income;

            if (existingIncome.isPresent()) {
                System.out.println("Updating existing overall budget for user " + userId);
                income = existingIncome.get();

                // 🔥 VERIFY: Double check this income belongs to current user
                if (!income.getUser().getId().equals(userId)) {
                    System.out.println("❌ CRITICAL ERROR: Retrieved income belongs to different user!");
                    throw new SecurityException("Data isolation violation detected");
                }

                income.setAmount(dto.getAmount());
                income.setNote(dto.getNote() != null ? dto.getNote() : "Overall Monthly Budget");
                income.setDate(dto.getDate() != null ? dto.getDate() : LocalDate.now());
            } else {
                System.out.println("Creating new overall budget for user " + userId);
                income = Income.builder()
                        .amount(dto.getAmount())
                        .currency(dto.getCurrency() != null ? dto.getCurrency() : user.getDefaultCurrency())
                        .note(dto.getNote() != null ? dto.getNote() : "Overall Monthly Budget")
                        .date(dto.getDate() != null ? dto.getDate() : LocalDate.now())
                        .user(user) // 🔥 CRITICAL: Explicitly set user
                        .category(null)
                        .build();
            }

            Income saved = incomeRepository.save(income);

            // 🔥 VERIFICATION: Ensure saved income belongs to correct user
            if (!saved.getUser().getId().equals(userId)) {
                System.out.println("❌ CRITICAL ERROR: Saved income has wrong user!");
                throw new SecurityException("Data integrity violation");
            }

            System.out.println("✅ Overall budget saved for user " + userId);
            System.out.println("=== ADD/UPDATE INCOME END (OVERALL) ===");
            return toDto(saved);
        }

        // CASE 2: Category-specific income allocation
        System.out.println("Processing CATEGORY-SPECIFIC income allocation for user " + userId);

        // 🔥 CRITICAL: Use findByIdAndUserId to verify category belongs to user
        Category category = categoryRepository.findByIdAndUserId(dto.getCategoryId(), userId)
                .orElseThrow(() -> {
                    System.out.println("❌ Category " + dto.getCategoryId() + " not found or doesn't belong to user " + userId);
                    return new EntityNotFoundException("Category not found or does not belong to user");
                });

        System.out.println("✅ Category verified: " + category.getName() + " (ID: " + category.getId() + ") for user " + userId);

        // Calculate currently allocated income (sum of all category-specific incomes for THIS user ONLY)
        Double currentAllocated = incomeRepository.sumCategoryIncomesByUserId(userId);
        if (currentAllocated == null) currentAllocated = 0.0;
        System.out.println("Current allocated income for user " + userId + ": " + currentAllocated);

        // 🔥 CRITICAL: Check if this category already has an income allocation FOR THIS USER
        Optional<Income> existingAllocation = incomeRepository.findByUserIdAndCategoryId(userId, dto.getCategoryId());
        double previousAmount = 0.0;
        if (existingAllocation.isPresent()) {
            Income existing = existingAllocation.get();

            // 🔥 VERIFY: Double check this income belongs to current user
            if (!existing.getUser().getId().equals(userId)) {
                System.out.println("❌ CRITICAL ERROR: Retrieved income belongs to different user!");
                throw new SecurityException("Data isolation violation detected");
            }

            previousAmount = existing.getAmount();
            System.out.println("Previous allocation for this category: " + previousAmount);
        }

        // Calculate new total allocated income
        double newTotal = currentAllocated - previousAmount + dto.getAmount();
        System.out.println("New total allocated would be: " + newTotal);
        System.out.println("User's overall budget: " + user.getMonthlyBudget());

        // Validate: total allocated cannot exceed overall budget
        if (newTotal > user.getMonthlyBudget()) {
            String errorMsg = String.format(
                    "Cannot allocate %.2f. Total allocated (%.2f) would exceed overall budget (%.2f)",
                    dto.getAmount(), newTotal, user.getMonthlyBudget()
            );
            System.out.println("❌ VALIDATION FAILED: " + errorMsg);
            throw new IllegalArgumentException(errorMsg);
        }

        // Create or update category income allocation
        Income income;
        if (existingAllocation.isPresent()) {
            System.out.println("Updating existing category income allocation for user " + userId);
            income = existingAllocation.get();
            income.setAmount(dto.getAmount());
            income.setNote(dto.getNote() != null ? dto.getNote() : "Income for " + category.getName());
            income.setDate(dto.getDate() != null ? dto.getDate() : LocalDate.now());
        } else {
            System.out.println("Creating new category income allocation for user " + userId);
            income = Income.builder()
                    .amount(dto.getAmount())
                    .currency(dto.getCurrency() != null ? dto.getCurrency() : user.getDefaultCurrency())
                    .note(dto.getNote() != null ? dto.getNote() : "Income for " + category.getName())
                    .date(dto.getDate() != null ? dto.getDate() : LocalDate.now())
                    .user(user) // 🔥 CRITICAL: Explicitly set user
                    .category(category)
                    .build();
        }

        Income saved = incomeRepository.save(income);

        // 🔥 VERIFICATION: Ensure saved income belongs to correct user
        if (!saved.getUser().getId().equals(userId)) {
            System.out.println("❌ CRITICAL ERROR: Saved income has wrong user!");
            throw new SecurityException("Data integrity violation");
        }

        System.out.println("✅ Category income saved for user " + userId);
        System.out.println("=== ADD/UPDATE INCOME END (CATEGORY) ===");
        return toDto(saved);
    }

    /**
     * List all incomes for a user (both overall and category-specific)
     * 🔥 Returns ONLY incomes that belong to this user
     */
    public List<IncomeDto> listUserIncomes(Long userId) {
        System.out.println("=== LISTING INCOMES FOR USER " + userId + " ===");
        List<Income> incomes = incomeRepository.findByUserId(userId);
        System.out.println("Found " + incomes.size() + " incomes");

        // 🔥 VERIFICATION: Ensure all returned incomes belong to this user
        for (Income income : incomes) {
            if (!income.getUser().getId().equals(userId)) {
                System.out.println("❌ CRITICAL ERROR: Income " + income.getId() + " belongs to user " + income.getUser().getId() + " but was returned for user " + userId);
                throw new SecurityException("Data isolation violation in listUserIncomes");
            }
        }

        return incomes.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Get income allocation for a specific category
     * 🔥 SECURITY: Verifies category belongs to user
     */
    public IncomeDto getCategoryIncome(Long userId, Long categoryId) {
        System.out.println("=== GETTING CATEGORY INCOME ===");
        System.out.println("User ID: " + userId);
        System.out.println("Category ID: " + categoryId);

        // 🔥 Verify category belongs to user
        categoryRepository.findByIdAndUserId(categoryId, userId)
                .orElseThrow(() -> new EntityNotFoundException("Category not found or does not belong to user"));

        Optional<Income> income = incomeRepository.findByUserIdAndCategoryId(userId, categoryId);

        if (income.isPresent()) {
            // 🔥 VERIFY: Double check income belongs to current user
            if (!income.get().getUser().getId().equals(userId)) {
                System.out.println("❌ CRITICAL ERROR: Retrieved income belongs to different user!");
                throw new SecurityException("Data isolation violation detected");
            }
        }

        return income.map(this::toDto).orElse(null);
    }

    /**
     * Delete an income record
     * 🔥 SECURITY: Verifies income belongs to user
     */
    @Transactional
    public void deleteIncome(Long userId, Long incomeId) {
        System.out.println("=== DELETING INCOME ===");
        System.out.println("User ID: " + userId);
        System.out.println("Income ID: " + incomeId);

        // 🔥 CRITICAL: Use findByIdAndUserId instead of findById
        Income income = incomeRepository.findByIdAndUserId(incomeId, userId)
                .orElseThrow(() -> new EntityNotFoundException("Income not found or does not belong to user"));

        // If deleting overall budget, set user's monthly budget to 0
        if (income.getCategory() == null) {
            User user = income.getUser();
            user.setMonthlyBudget(0.0);
            userRepository.save(user);
            System.out.println("✅ Reset monthly budget to 0 for user " + userId);
        }

        incomeRepository.delete(income);
        System.out.println("✅ Income deleted for user " + userId);
    }

    /**
     * Convert Income entity to DTO
     * 🔥 ALWAYS includes userId for verification
     */
    private IncomeDto toDto(Income income) {
        IncomeDto dto = new IncomeDto();
        dto.setId(income.getId());
        dto.setAmount(income.getAmount());
        dto.setCurrency(income.getCurrency());
        dto.setNote(income.getNote());
        dto.setDate(income.getDate());
        dto.setCategoryId(income.getCategory() != null ? income.getCategory().getId() : null);
        dto.setUserId(income.getUser().getId()); // 🔥 CRITICAL: Always include userId
        return dto;
    }
}