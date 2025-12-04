// Backend/Budgitup/src/main/java/org/g3_inge4_isi_en/budgitup/controller/BudgetController.java
// NEW FILE - Add this to your backend
package org.g3_inge4_isi_en.budgitup.controller;

import lombok.RequiredArgsConstructor;
import org.g3_inge4_isi_en.budgitup.dto.BudgetDto;
import org.g3_inge4_isi_en.budgitup.service.BudgetService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/budgets")
@RequiredArgsConstructor
public class BudgetController {

    private final BudgetService budgetService;

    /**
     * GET /api/budgets/user/{userId}
     * Get all budgets for a user
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<BudgetDto>> getUserBudgets(@PathVariable Long userId) {
        return ResponseEntity.ok(budgetService.getUserBudgets(userId));
    }

    /**
     * GET /api/budgets/user/{userId}/category/{categoryId}
     * Get budget for a specific category
     */
    @GetMapping("/user/{userId}/category/{categoryId}")
    public ResponseEntity<BudgetDto> getCategoryBudget(
            @PathVariable Long userId,
            @PathVariable Long categoryId) {
        BudgetDto budget = budgetService.getCategoryBudget(userId, categoryId);
        if (budget == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(budget);
    }

    /**
     * POST /api/budgets/user/{userId}/category/{categoryId}
     * Set or update budget for a category
     * Request body: { "amount": 1000.0 }
     */
    @PostMapping("/user/{userId}/category/{categoryId}")
    public ResponseEntity<BudgetDto> setCategoryBudget(
            @PathVariable Long userId,
            @PathVariable Long categoryId,
            @RequestBody BudgetDto budgetDto) {
        BudgetDto result = budgetService.setCategoryBudget(userId, categoryId, budgetDto.getAmount());
        return ResponseEntity.ok(result);
    }

    /**
     * DELETE /api/budgets/user/{userId}/category/{categoryId}
     * Delete budget for a category
     */
    @DeleteMapping("/user/{userId}/category/{categoryId}")
    public ResponseEntity<Void> deleteCategoryBudget(
            @PathVariable Long userId,
            @PathVariable Long categoryId) {
        budgetService.deleteCategoryBudget(userId, categoryId);
        return ResponseEntity.noContent().build();
    }
}