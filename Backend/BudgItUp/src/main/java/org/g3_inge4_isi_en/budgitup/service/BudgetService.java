// Backend/Budgitup/src/main/java/org/g3_inge4_isi_en/budgitup/service/BudgetService.java
package org.g3_inge4_isi_en.budgitup.service;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.g3_inge4_isi_en.budgitup.dto.BudgetDto;
import org.g3_inge4_isi_en.budgitup.entity.Budget;
import org.g3_inge4_isi_en.budgitup.entity.Category;
import org.g3_inge4_isi_en.budgitup.entity.User;
import org.g3_inge4_isi_en.budgitup.repository.BudgetRepository;
import org.g3_inge4_isi_en.budgitup.repository.CategoryRepository;
import org.g3_inge4_isi_en.budgitup.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;

    /**
     * Get all budgets for a user
     */
    public List<BudgetDto> getUserBudgets(Long userId) {
        return budgetRepository.findByUserId(userId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Get budget for a specific category
     * 🔥 SECURITY: Only returns budget if it belongs to the user
     */
    public BudgetDto getCategoryBudget(Long userId, Long categoryId) {
        // 🔥 Verify category belongs to user first
        Category category = categoryRepository.findByIdAndUserId(categoryId, userId)
                .orElseThrow(() -> new EntityNotFoundException("Category not found or does not belong to user"));

        Optional<Budget> budget = budgetRepository.findByUserIdAndCategoryId(userId, categoryId);
        return budget.map(this::toDto).orElse(null);
    }

    /**
     * Set or update budget for a category
     * 🔥 SECURITY: Verifies category belongs to user
     */
    @Transactional
    public BudgetDto setCategoryBudget(Long userId, Long categoryId, double amount) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        // 🔥 CRITICAL: Verify category belongs to user using findByIdAndUserId
        Category category = categoryRepository.findByIdAndUserId(categoryId, userId)
                .orElseThrow(() -> new EntityNotFoundException("Category not found or does not belong to user"));

        // Check if budget already exists for this user and category
        Optional<Budget> existingBudget = budgetRepository.findByUserIdAndCategoryId(userId, categoryId);

        Budget budget;
        if (existingBudget.isPresent()) {
            // Update existing budget
            budget = existingBudget.get();
            budget.setAmount(amount);
        } else {
            // Create new budget
            budget = Budget.builder()
                    .amount(amount)
                    .currency(user.getDefaultCurrency())
                    .user(user)
                    .category(category)
                    .build();
        }

        Budget saved = budgetRepository.save(budget);
        return toDto(saved);
    }

    /**
     * Delete budget for a category
     * 🔥 SECURITY: Verifies budget belongs to user
     */
    @Transactional
    public void deleteCategoryBudget(Long userId, Long categoryId) {
        // 🔥 Verify category belongs to user
        categoryRepository.findByIdAndUserId(categoryId, userId)
                .orElseThrow(() -> new EntityNotFoundException("Category not found or does not belong to user"));

        Optional<Budget> budget = budgetRepository.findByUserIdAndCategoryId(userId, categoryId);

        if (budget.isPresent()) {
            budgetRepository.delete(budget.get());
        }
    }

    /**
     * Convert Budget entity to DTO
     */
    private BudgetDto toDto(Budget budget) {
        BudgetDto dto = new BudgetDto();
        dto.setId(budget.getId());
        dto.setAmount(budget.getAmount());
        dto.setCurrency(budget.getCurrency());
        dto.setCategoryId(budget.getCategory().getId());
        dto.setUserId(budget.getUser().getId());
        return dto;
    }
}