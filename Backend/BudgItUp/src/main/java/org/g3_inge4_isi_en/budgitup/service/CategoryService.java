// Backend/Budgitup/src/main/java/org/g3_inge4_isi_en/budgitup/service/CategoryService.java
// COPY AND PASTE THIS ENTIRE FILE - REPLACES YOUR EXISTING CategoryService.java

package org.g3_inge4_isi_en.budgitup.service;

import org.g3_inge4_isi_en.budgitup.dto.CategoryDto;
import org.g3_inge4_isi_en.budgitup.entity.Category;
import org.g3_inge4_isi_en.budgitup.entity.User;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.g3_inge4_isi_en.budgitup.repository.CategoryRepository;
import org.g3_inge4_isi_en.budgitup.repository.UserRepository;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    /**
     * List system default categories (for signup selection only)
     * These have isDefault=true and user_id=null
     */
    public List<CategoryDto> listDefaultCategories() {
        return categoryRepository.findByIsDefaultTrue().stream()
                .filter(c -> c.getUser() == null) // Only system defaults
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    /**
     * List categories for a specific user only
     * Returns ONLY categories that belong to this user
     * Includes both:
     *  - Chosen defaults (isDefault=true, user_id=userId) - can't delete
     *  - Truly custom (isDefault=false, user_id=userId) - can delete
     */
    public List<CategoryDto> listUserCategories(Long userId) {
        return categoryRepository.findByUserId(userId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Create a truly custom category for a user
     * These have isDefault=false and can be deleted by user
     */
    @Transactional
    public CategoryDto createCustomCategory(Long userId, CategoryDto dto) {
        if (dto.getName() == null || dto.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Category name required");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        // Check uniqueness: only within this user's categories
        List<Category> userCats = categoryRepository.findByUserId(userId);
        boolean exists = userCats.stream()
                .anyMatch(c -> c.getName().equalsIgnoreCase(dto.getName().trim()));

        if (exists) {
            throw new IllegalArgumentException("You already have a category with that name");
        }

        Category cat = Category.builder()
                .name(dto.getName().trim())
                .color(dto.getColor())
                .icon(dto.geticon())
                .isDefault(false) // Truly custom categories are NOT default (can be deleted)
                .user(user)
                .build();

        Category saved = categoryRepository.save(cat);
        return toDto(saved);
    }

    /**
     * Update a category
     * Ensures the category belongs to this user
     * Can update both chosen defaults and truly custom categories
     */
    @Transactional
    public CategoryDto updateCustomCategory(Long userId, Long categoryId, CategoryDto dto) {
        Category cat = categoryRepository.findByIdAndUserId(categoryId, userId)
                .orElseThrow(() -> new EntityNotFoundException("Category not found or does not belong to you"));

        // If renaming, check uniqueness within user's categories (exclude itself)
        if (!cat.getName().equalsIgnoreCase(dto.getName())) {
            List<Category> userCats = categoryRepository.findByUserId(userId);
            boolean exists = userCats.stream()
                    .filter(c -> !c.getId().equals(categoryId))
                    .anyMatch(c -> c.getName().equalsIgnoreCase(dto.getName()));

            if (exists) {
                throw new IllegalArgumentException("You already have a category with that name");
            }
            cat.setName(dto.getName().trim());
        }

        cat.setColor(dto.getColor());
        if (dto.geticon() != null) {
            cat.setIcon(dto.geticon());
        }

        Category updated = categoryRepository.save(cat);
        return toDto(updated);
    }

    /**
     * Delete a category
     * ONLY allows deletion of truly custom categories (isDefault=false)
     * Prevents deletion of user's chosen defaults (isDefault=true)
     */
    @Transactional
    public void deleteCustomCategory(Long userId, Long categoryId) {
        Category cat = categoryRepository.findByIdAndUserId(categoryId, userId)
                .orElseThrow(() -> new EntityNotFoundException("Category not found or does not belong to you"));

        // IMPORTANT: Prevent deletion of chosen defaults
        if (cat.isDefault()) {
            throw new IllegalArgumentException("Cannot delete default categories. You can only delete custom categories you've created.");
        }

        // Cascade delete is handled by @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
        categoryRepository.delete(cat);
    }

    private CategoryDto toDto(Category c) {
        CategoryDto dto = new CategoryDto();
        dto.setId(c.getId());
        dto.setName(c.getName());
        dto.setColor(c.getColor());
        dto.seticon(c.getIcon());
        dto.setDefault(c.isDefault()); // TRUE = chosen default, FALSE = truly custom
        return dto;
    }
}