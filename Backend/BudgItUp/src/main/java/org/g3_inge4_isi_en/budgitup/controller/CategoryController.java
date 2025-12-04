// Backend/Budgitup/src/main/java/org/g3_inge4_isi_en/budgitup/controller/CategoryController.java
package org.g3_inge4_isi_en.budgitup.controller;

import lombok.RequiredArgsConstructor;
import org.g3_inge4_isi_en.budgitup.dto.CategoryDto;
import org.g3_inge4_isi_en.budgitup.service.CategoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    /**
     * GET /api/categories/defaults
     * Returns system default categories (for signup page - NO AUTH REQUIRED)
     */
    @GetMapping("/defaults")
    public ResponseEntity<List<CategoryDto>> getDefaultCategories() {
        return ResponseEntity.ok(categoryService.listDefaultCategories());
    }

    /**
     * GET /api/categories/user/{userId}
     * Returns categories for a specific user (BOTH chosen defaults + truly custom)
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<CategoryDto>> getUserCategories(@PathVariable Long userId) {
        return ResponseEntity.ok(categoryService.listUserCategories(userId));
    }

    /**
     * POST /api/categories/user/{userId}
     * Create a new TRULY CUSTOM category for user (isDefault=false, can be deleted)
     */
    @PostMapping("/user/{userId}")
    public ResponseEntity<CategoryDto> createCustomCategory(
            @PathVariable Long userId,
            @RequestBody CategoryDto dto) {
        return ResponseEntity.ok(categoryService.createCustomCategory(userId, dto));
    }

    /**
     * PUT /api/categories/user/{userId}/{categoryId}
     * Update a category (works for both chosen defaults and truly custom)
     */
    @PutMapping("/user/{userId}/{categoryId}")
    public ResponseEntity<CategoryDto> updateCustomCategory(
            @PathVariable Long userId,
            @PathVariable Long categoryId,
            @RequestBody CategoryDto dto) {
        return ResponseEntity.ok(categoryService.updateCustomCategory(userId, categoryId, dto));
    }

    /**
     * DELETE /api/categories/user/{userId}/{categoryId}
     * Delete a category - ONLY allows deletion of truly custom categories (isDefault=false)
     * Prevents deletion of chosen defaults (isDefault=true)
     */
    @DeleteMapping("/user/{userId}/{categoryId}")
    public ResponseEntity<Void> deleteCustomCategory(
            @PathVariable Long userId,
            @PathVariable Long categoryId) {
        categoryService.deleteCustomCategory(userId, categoryId);
        return ResponseEntity.noContent().build();
    }
}