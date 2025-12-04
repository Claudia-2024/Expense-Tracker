// Backend/Budgitup/src/main/java/org/g3_inge4_isi_en/budgitup/repository/ExpenseRepository.java
package org.g3_inge4_isi_en.budgitup.repository;

import org.g3_inge4_isi_en.budgitup.entity.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    /**
     * Find all expenses for a specific user
     */
    List<Expense> findByUserId(Long userId);

    /**
     * Find expense by ID and verify it belongs to the user
     */
    Optional<Expense> findByIdAndUserId(Long id, Long userId);

    /**
     * Get total expenses for a specific category (user-specific)
     * CRITICAL: Only sum expenses for categories that belong to this user
     */
    @Query("SELECT COALESCE(SUM(e.amount), 0.0) FROM Expense e WHERE e.category.id = :categoryId AND e.user.id = :userId")
    Double sumAmountByCategoryIdAndUserId(@Param("categoryId") Long categoryId, @Param("userId") Long userId);

    /**
     * Delete all expenses for a specific category (used when deleting category)
     */
    void deleteByCategoryId(Long categoryId);
}