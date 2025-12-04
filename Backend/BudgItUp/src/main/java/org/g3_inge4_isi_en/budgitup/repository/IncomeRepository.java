// Backend/Budgitup/src/main/java/org/g3_inge4_isi_en/budgitup/repository/IncomeRepository.java
package org.g3_inge4_isi_en.budgitup.repository;

import org.g3_inge4_isi_en.budgitup.entity.Income;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface IncomeRepository extends JpaRepository<Income, Long> {

    /**
     * Find all incomes for a specific user
     */
    List<Income> findByUserId(Long userId);

    /**
     * Find income for a specific user and category
     */
    Optional<Income> findByUserIdAndCategoryId(Long userId, Long categoryId);

    /**
     * Find overall budget income (where category is null) for a user
     */
    Optional<Income> findByUserIdAndCategoryIsNull(Long userId);

    /**
     * 🔥 NEW: Find income by ID and verify it belongs to user
     */
    Optional<Income> findByIdAndUserId(Long id, Long userId);

    /**
     * Sum all category-specific incomes for a user (excluding overall budget)
     */
    @Query("SELECT COALESCE(SUM(i.amount), 0.0) FROM Income i WHERE i.user.id = :userId AND i.category IS NOT NULL")
    Double sumCategoryIncomesByUserId(@Param("userId") Long userId);

    /**
     * 🔥 FIXED: Sum income for a specific category AND user
     */
    @Query("SELECT COALESCE(SUM(i.amount), 0.0) FROM Income i WHERE i.category.id = :categoryId AND i.user.id = :userId")
    Double sumAmountByCategoryIdAndUserId(@Param("categoryId") Long categoryId, @Param("userId") Long userId);
}