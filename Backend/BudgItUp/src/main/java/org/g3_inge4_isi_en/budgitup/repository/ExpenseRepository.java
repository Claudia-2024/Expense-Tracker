package org.g3_inge4_isi_en.budgitup.repository;

import org.g3_inge4_isi_en.budgitup.entity.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    List<Expense> findByUserId(Long userId);

    List<Expense> findByUserIdAndDateBetween(Long userId, LocalDate startDate, LocalDate endDate);

    List<Expense> findByUserIdAndCategoryId(Long userId, Long categoryId);

    // Sum amount by category ID
    @Query("SELECT COALESCE(SUM(e.amount), 0.0) FROM Expense e WHERE e.category.id = :categoryId")
    Double sumAmountByCategoryId(@Param("categoryId") Long categoryId);

    // Sum amount by category ID and user ID
    @Query("SELECT COALESCE(SUM(e.amount), 0.0) FROM Expense e WHERE e.category.id = :categoryId AND e.user.id = :userId")
    Double sumAmountByCategoryIdAndUserId(@Param("categoryId") Long categoryId, @Param("userId") Long userId);

    // Sum amount by category ID and date range
    @Query("SELECT COALESCE(SUM(e.amount), 0.0) FROM Expense e WHERE e.category.id = :categoryId AND e.date BETWEEN :startDate AND :endDate")
    Double sumAmountByCategoryIdAndDateBetween(
            @Param("categoryId") Long categoryId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    // Sum amount by user ID and date range
    @Query("SELECT COALESCE(SUM(e.amount), 0.0) FROM Expense e WHERE e.user.id = :userId AND e.date BETWEEN :startDate AND :endDate")
    Double sumAmountByUserIdAndDateBetween(
            @Param("userId") Long userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    // Sum amount by category ID, user ID and date range (most specific)
    @Query("SELECT COALESCE(SUM(e.amount), 0.0) FROM Expense e WHERE e.category.id = :categoryId AND e.user.id = :userId AND e.date BETWEEN :startDate AND :endDate")
    Double sumAmountByCategoryIdAndUserIdAndDateBetween(
            @Param("categoryId") Long categoryId,
            @Param("userId") Long userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );
}