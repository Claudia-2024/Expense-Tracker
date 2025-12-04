// Backend/Budgitup/src/main/java/org/g3_inge4_isi_en/budgitup/controller/ExpenseController.java
package org.g3_inge4_isi_en.budgitup.controller;

import lombok.RequiredArgsConstructor;
import org.g3_inge4_isi_en.budgitup.dto.ExpenseDto;
import org.g3_inge4_isi_en.budgitup.service.ExpenseService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/expenses")
@RequiredArgsConstructor
public class ExpenseController {

    private final ExpenseService expenseService;

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ExpenseDto>> listUserExpenses(@PathVariable Long userId) {
        return ResponseEntity.ok(expenseService.listUserExpenses(userId));
    }

    @PostMapping("/user/{userId}")
    public ResponseEntity<ExpenseDto> createExpense(
            @PathVariable Long userId,
            @RequestBody ExpenseDto dto) {
        return ResponseEntity.ok(expenseService.createExpense(userId, dto));
    }

    @PutMapping("/user/{userId}/{expenseId}")
    public ResponseEntity<ExpenseDto> updateExpense(
            @PathVariable Long userId,
            @PathVariable Long expenseId,
            @RequestBody ExpenseDto dto) {
        return ResponseEntity.ok(expenseService.updateExpense(userId, expenseId, dto));
    }

    @DeleteMapping("/user/{userId}/{expenseId}")
    public ResponseEntity<Void> deleteExpense(
            @PathVariable Long userId,
            @PathVariable Long expenseId) {
        expenseService.deleteExpense(userId, expenseId);
        return ResponseEntity.noContent().build();
    }

    /**
     * 🔥 UPDATED: Now requires userId for proper isolation
     */
    @GetMapping("/user/{userId}/category/{categoryId}/total")
    public ResponseEntity<Double> getCategoryTotal(
            @PathVariable Long userId,
            @PathVariable Long categoryId) {
        return ResponseEntity.ok(expenseService.getCategoryTotal(userId, categoryId));
    }
}