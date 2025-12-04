// Backend/Budgitup/src/main/java/org/g3_inge4_isi_en/budgitup/repository/BudgetRepository.java
package org.g3_inge4_isi_en.budgitup.repository;

import org.g3_inge4_isi_en.budgitup.entity.Budget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BudgetRepository extends JpaRepository<Budget, Long> {

    /**
     * Find all budgets for a specific user
     */
    List<Budget> findByUserId(Long userId);

    /**
     * Find budget for a specific user and category
     */
    Optional<Budget> findByUserIdAndCategoryId(Long userId, Long categoryId);

    /**
     * 🔥 NEW: Find budget by ID and verify it belongs to user
     */
    Optional<Budget> findByIdAndUserId(Long id, Long userId);

    /**
     * Delete all budgets for a specific category
     * (Used when deleting a category)
     */
    void deleteByCategoryId(Long categoryId);

    /**
     * 🔥 NEW: Delete budget by ID only if it belongs to user
     */
    void deleteByIdAndUserId(Long id, Long userId);
}