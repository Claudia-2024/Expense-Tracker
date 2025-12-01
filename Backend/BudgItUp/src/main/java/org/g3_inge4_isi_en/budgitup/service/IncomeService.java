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
     * - If categoryId is null: Updates overall monthly budget and creates/updates overall income record
     * - If categoryId is provided: Allocates income to specific category (validates against overall budget)
     */
    @Transactional
    public IncomeDto addOrUpdateIncome(Long userId, IncomeDto dto) {
        System.out.println("=== ADD/UPDATE INCOME START ===");
        System.out.println("User ID: " + userId);
        System.out.println("Amount: " + dto.getAmount());
        System.out.println("Category ID: " + dto.getCategoryId());
        System.out.println("Note: " + dto.getNote());
        System.out.println("Date: " + dto.getDate());

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        // CASE 1: Overall Budget (no category selected)
        if (dto.getCategoryId() == null) {
            System.out.println("Processing OVERALL BUDGET income");

            // Update user's monthly budget
            user.setMonthlyBudget(dto.getAmount());
            userRepository.save(user);
            System.out.println("Updated user monthly budget to: " + dto.getAmount());

            // Create or update overall income record (categoryId = null)
            Optional<Income> existingIncome = incomeRepository.findByUserIdAndCategoryIsNull(userId);
            Income income;

            if (existingIncome.isPresent()) {
                System.out.println("Updating existing overall income record");
                income = existingIncome.get();
                income.setAmount(dto.getAmount());
                income.setNote(dto.getNote() != null ? dto.getNote() : "Overall Monthly Budget");
                income.setDate(dto.getDate() != null ? dto.getDate() : LocalDate.now());
            } else {
                System.out.println("Creating new overall income record");
                income = Income.builder()
                        .amount(dto.getAmount())
                        .currency(dto.getCurrency() != null ? dto.getCurrency() : user.getDefaultCurrency())
                        .note(dto.getNote() != null ? dto.getNote() : "Overall Monthly Budget")
                        .date(dto.getDate() != null ? dto.getDate() : LocalDate.now())
                        .user(user)
                        .category(null) // NULL = overall budget
                        .build();
            }

            Income saved = incomeRepository.save(income);
            System.out.println("Saved overall income with ID: " + saved.getId());
            System.out.println("=== ADD/UPDATE INCOME END (OVERALL) ===");
            return toDto(saved);
        }

        // CASE 2: Category-specific income allocation
        System.out.println("Processing CATEGORY-SPECIFIC income allocation");

        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new EntityNotFoundException("Category not found"));

        // Verify category belongs to user
        if (category.getUser() == null || !category.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Category does not belong to user");
        }
        System.out.println("Category verified: " + category.getName());

        // Calculate currently allocated income (sum of all category-specific incomes)
        Double currentAllocated = incomeRepository.sumCategoryIncomesByUserId(userId);
        if (currentAllocated == null) currentAllocated = 0.0;
        System.out.println("Current allocated income: " + currentAllocated);

        // Check if this category already has an income allocation
        Optional<Income> existingAllocation = incomeRepository.findByUserIdAndCategoryId(userId, dto.getCategoryId());
        double previousAmount = 0.0;
        if (existingAllocation.isPresent()) {
            previousAmount = existingAllocation.get().getAmount();
            System.out.println("Previous allocation for this category: " + previousAmount);
        }

        // Calculate new total allocated income
        double newTotal = currentAllocated - previousAmount + dto.getAmount();
        System.out.println("New total allocated would be: " + newTotal);
        System.out.println("User's overall budget: " + user.getMonthlyBudget());

        // Validate: total allocated cannot exceed overall budget
        if (newTotal > user.getMonthlyBudget()) {
            String errorMsg = String.format(
                    "Cannot allocate %.2f XAF. Total allocated (%.2f XAF) would exceed overall budget (%.2f XAF)",
                    dto.getAmount(), newTotal, user.getMonthlyBudget()
            );
            System.out.println("VALIDATION FAILED: " + errorMsg);
            throw new IllegalArgumentException(errorMsg);
        }

        // Create or update category income allocation
        Income income;
        if (existingAllocation.isPresent()) {
            System.out.println("Updating existing category income allocation");
            income = existingAllocation.get();
            income.setAmount(dto.getAmount());
            income.setNote(dto.getNote() != null ? dto.getNote() : "Income for " + category.getName());
            income.setDate(dto.getDate() != null ? dto.getDate() : LocalDate.now());
        } else {
            System.out.println("Creating new category income allocation");
            income = Income.builder()
                    .amount(dto.getAmount())
                    .currency(dto.getCurrency() != null ? dto.getCurrency() : user.getDefaultCurrency())
                    .note(dto.getNote() != null ? dto.getNote() : "Income for " + category.getName())
                    .date(dto.getDate() != null ? dto.getDate() : LocalDate.now())
                    .user(user)
                    .category(category)
                    .build();
        }

        Income saved = incomeRepository.save(income);
        System.out.println("Saved category income with ID: " + saved.getId());
        System.out.println("=== ADD/UPDATE INCOME END (CATEGORY) ===");
        return toDto(saved);
    }

    /**
     * List all incomes for a user (both overall and category-specific)
     */
    public List<IncomeDto> listUserIncomes(Long userId) {
        return incomeRepository.findByUserId(userId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Get income allocation for a specific category
     */
    public IncomeDto getCategoryIncome(Long userId, Long categoryId) {
        Optional<Income> income = incomeRepository.findByUserIdAndCategoryId(userId, categoryId);
        return income.map(this::toDto).orElse(null);
    }

    /**
     * Delete an income record
     */
    @Transactional
    public void deleteIncome(Long userId, Long incomeId) {
        Income income = incomeRepository.findById(incomeId)
                .orElseThrow(() -> new EntityNotFoundException("Income not found"));

        // Verify income belongs to user
        if (!income.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Income does not belong to user");
        }

        // If deleting overall budget, set user's monthly budget to 0
        if (income.getCategory() == null) {
            User user = income.getUser();
            user.setMonthlyBudget(0.0);
            userRepository.save(user);
        }

        incomeRepository.delete(income);
    }

    /**
     * Convert Income entity to DTO
     */
    private IncomeDto toDto(Income income) {
        IncomeDto dto = new IncomeDto();
        dto.setId(income.getId());
        dto.setAmount(income.getAmount());
        dto.setCurrency(income.getCurrency());
        dto.setNote(income.getNote());
        dto.setDate(income.getDate());
        dto.setCategoryId(income.getCategory() != null ? income.getCategory().getId() : null);
        dto.setUserId(income.getUser().getId());
        return dto;
    }
}