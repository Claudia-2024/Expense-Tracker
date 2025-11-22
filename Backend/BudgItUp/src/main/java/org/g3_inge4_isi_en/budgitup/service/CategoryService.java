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

    public List<CategoryDto> listDefaultCategories() {
        return categoryRepository.findByIsDefaultTrue().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public List<CategoryDto> listUserCategories(Long userId) {
        return categoryRepository.findByUserId(userId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public CategoryDto createCustomCategory(Long userId, CategoryDto dto) {
        if (dto.getName() == null || dto.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Category name required");
        }

        // Check uniqueness (case-insensitive) for this user
        List<Category> userCats = categoryRepository.findByUserId(userId);
        boolean exists = userCats.stream()
                .anyMatch(c -> c.getName().equalsIgnoreCase(dto.getName().trim()));

        if (exists) {
            throw new IllegalArgumentException("Category with that name already exists");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        Category cat = Category.builder()
                .name(dto.getName().trim())
                .color(dto.getColor())
                .icon(dto.geticon()) // Add icon
                .isDefault(false)
                .user(user)
                .build();

        Category saved = categoryRepository.save(cat);
        return toDto(saved);
    }

    @Transactional
    public CategoryDto updateCustomCategory(Long userId, Long categoryId, CategoryDto dto) {
        Category cat = categoryRepository.findByIdAndUserId(categoryId, userId)
                .orElseThrow(() -> new EntityNotFoundException("Category not found or not owned by user"));

        // If renaming, check uniqueness (exclude itself)
        if (!cat.getName().equalsIgnoreCase(dto.getName())) {
            List<Category> userCats = categoryRepository.findByUserId(userId);
            boolean exists = userCats.stream()
                    .filter(c -> !c.getId().equals(categoryId))
                    .anyMatch(c -> c.getName().equalsIgnoreCase(dto.getName()));

            if (exists) {
                throw new IllegalArgumentException("Category with that name already exists");
            }
            cat.setName(dto.getName().trim());
        }

        cat.setColor(dto.getColor());
        if (dto.geticon() != null) {
            cat.setIcon(dto.geticon()); // Update icon
        }

        Category updated = categoryRepository.save(cat);
        return toDto(updated);
    }

    @Transactional
    public void deleteCustomCategory(Long userId, Long categoryId) {
        Category cat = categoryRepository.findByIdAndUserId(categoryId, userId)
                .orElseThrow(() -> new EntityNotFoundException("Category not found or not owned by user"));

        categoryRepository.delete(cat);
    }

    private CategoryDto toDto(Category c) {
        CategoryDto dto = new CategoryDto();
        dto.setId(c.getId());
        dto.setName(c.getName());
        dto.setColor(c.getColor());
        dto.seticon(c.getIcon()); // Include icon
        dto.setDefault(c.isDefault());
        return dto;
    }
}