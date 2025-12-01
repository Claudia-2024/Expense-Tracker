package org.g3_inge4_isi_en.budgitup.controller;

import lombok.RequiredArgsConstructor;
import org.g3_inge4_isi_en.budgitup.dto.IncomeDto;
import org.g3_inge4_isi_en.budgitup.service.IncomeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/incomes")
@RequiredArgsConstructor
public class IncomeController {

    private final IncomeService incomeService;

    @PostMapping("/user/{userId}")
    public ResponseEntity<IncomeDto> addOrUpdateIncome(
            @PathVariable Long userId,
            @RequestBody IncomeDto dto) {
        return ResponseEntity.ok(incomeService.addOrUpdateIncome(userId, dto));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<IncomeDto>> listUserIncomes(@PathVariable Long userId) {
        return ResponseEntity.ok(incomeService.listUserIncomes(userId));
    }

    @GetMapping("/user/{userId}/category/{categoryId}")
    public ResponseEntity<IncomeDto> getCategoryIncome(
            @PathVariable Long userId,
            @PathVariable Long categoryId) {
        IncomeDto income = incomeService.getCategoryIncome(userId, categoryId);
        if (income == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(income);
    }

    @DeleteMapping("/user/{userId}/{incomeId}")
    public ResponseEntity<Void> deleteIncome(
            @PathVariable Long userId,
            @PathVariable Long incomeId) {
        incomeService.deleteIncome(userId, incomeId);
        return ResponseEntity.noContent().build();
    }
}
