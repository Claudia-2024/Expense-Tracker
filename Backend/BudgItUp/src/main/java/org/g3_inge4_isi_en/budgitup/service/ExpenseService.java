// Backend/Budgitup/src/main/java/org/g3_inge4_isi_en/budgitup/service/ExpenseService.java
// COPY AND PASTE THIS ENTIRE FILE - REPLACES YOUR EXISTING ExpenseService.java

package org.g3_inge4_isi_en.budgitup.service;

import org.g3_inge4_isi_en.budgitup.dto.ExpenseDto;
import org.g3_inge4_isi_en.budgitup.entity.Category;
import org.g3_inge4_isi_en.budgitup.entity.Expense;
import org.g3_inge4_isi_en.budgitup.entity.User;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.g3_inge4_isi_en.budgitup.repository.CategoryRepository;
import org.g3_inge4_isi_en.budgitup.repository.ExpenseRepository;
import org.g3_inge4_isi_en.budgitup.repository.UserRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;

    /**
     * List all expenses for a specific user only
     */
    public List<ExpenseDto> listUserExpenses(Long userId) {
        return expenseRepository.findByUserId(userId).stream()
                .map(this::toDto).collect(Collectors.toList());
    }

    /**
     * Create an expense for a user
     * Ensures the category belongs to this user
     */
    @Transactional
    public ExpenseDto createExpense(Long userId, ExpenseDto dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new EntityNotFoundException("Category not found"));

        // CRITICAL: Verify category belongs to this user
        if (category.getUser() == null || !category.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Category does not belong to user");
        }

        Expense e = Expense.builder()
                .amount(dto.getAmount())
                .currency(dto.getCurrency() != null ? dto.getCurrency() : user.getDefaultCurrency())
                .note(dto.getNote())
                .date(dto.getDate() != null ? dto.getDate() : LocalDate.now())
                .user(user)
                .category(category)
                .build();

        Expense saved = expenseRepository.save(e);
        return toDto(saved);
    }

    /**
     * Update an expense
     * Ensures the expense belongs to this user
     */
    @Transactional
    public ExpenseDto updateExpense(Long userId, Long expenseId, ExpenseDto dto) {
        Expense existing = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new EntityNotFoundException("Expense not found"));

        // CRITICAL: Verify expense belongs to this user
        if (!existing.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Expense does not belong to user");
        }

        // If changing category, verify new category belongs to user
        if (dto.getCategoryId() != null && !existing.getCategory().getId().equals(dto.getCategoryId())) {
            Category newCat = categoryRepository.findById(dto.getCategoryId())
                    .orElseThrow(() -> new EntityNotFoundException("Category not found"));

            // CRITICAL: Verify new category belongs to this user
            if (newCat.getUser() == null || !newCat.getUser().getId().equals(userId)) {
                throw new IllegalArgumentException("Category does not belong to user");
            }
            existing.setCategory(newCat);
        }

        existing.setAmount(dto.getAmount());
        existing.setCurrency(dto.getCurrency());
        existing.setNote(dto.getNote());
        existing.setDate(dto.getDate());

        Expense saved = expenseRepository.save(existing);
        return toDto(saved);
    }

    /**
     * Delete an expense
     * Ensures the expense belongs to this user
     */
    @Transactional
    public void deleteExpense(Long userId, Long expenseId) {
        Expense existing = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new EntityNotFoundException("Expense not found"));

        // CRITICAL: Verify expense belongs to this user
        if (!existing.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Expense does not belong to user");
        }
        expenseRepository.delete(existing);
    }

    /**
     * Get total for a category
     * Now uses user-specific query to ensure proper isolation
     */
    public double getCategoryTotal(Long categoryId) {
        Double sum = expenseRepository.sumAmountByCategoryId(categoryId);
        return sum != null ? sum : 0.0;
    }

    private ExpenseDto toDto(Expense e) {
        ExpenseDto dto = new ExpenseDto();
        dto.setId(e.getId());
        dto.setAmount(e.getAmount());
        dto.setCurrency(e.getCurrency());
        dto.setNote(e.getNote());
        dto.setDate(e.getDate());
        dto.setCategoryId(e.getCategory().getId());
        dto.setUserId(e.getUser().getId());
        return dto;
    }
}