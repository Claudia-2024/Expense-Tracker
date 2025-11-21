package org.g3_inge4_isi_en.budgitup.controller;

import org.g3_inge4_isi_en.budgitup.dto.CategoryDto;
import org.g3_inge4_isi_en.budgitup.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping("/defaults")
    public ResponseEntity<List<CategoryDto>> getDefaultCategories() {
        return ResponseEntity.ok(categoryService.listDefaultCategories());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<CategoryDto>> getUserCategories(@PathVariable Long userId) {
        return ResponseEntity.ok(categoryService.listUserCategories(userId));
    }

    @PostMapping("/user/{userId}")
    public ResponseEntity<CategoryDto> createCategory(
            @PathVariable Long userId,
            @RequestBody CategoryDto categoryDto) {
        return ResponseEntity.ok(categoryService.createCustomCategory(userId, categoryDto));
    }

    @PutMapping("/user/{userId}/{categoryId}")
    public ResponseEntity<CategoryDto> updateCategory(
            @PathVariable Long userId,
            @PathVariable Long categoryId,
            @RequestBody CategoryDto categoryDto) {
        return ResponseEntity.ok(categoryService.updateCustomCategory(userId, categoryId, categoryDto));
    }

    @DeleteMapping("/user/{userId}/{categoryId}")
    public ResponseEntity<Void> deleteCategory(
            @PathVariable Long userId,
            @PathVariable Long categoryId) {
        categoryService.deleteCustomCategory(userId, categoryId);
        return ResponseEntity.noContent().build();
    }
}