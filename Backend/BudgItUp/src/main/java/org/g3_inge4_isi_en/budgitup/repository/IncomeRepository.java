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

    List<Income> findByUserId(Long userId);

    Optional<Income> findByUserIdAndCategoryId(Long userId, Long categoryId);

    Optional<Income> findByUserIdAndCategoryIsNull(Long userId);

    @Query("SELECT COALESCE(SUM(i.amount), 0.0) FROM Income i WHERE i.user.id = :userId AND i.category IS NOT NULL")
    Double sumCategoryIncomesByUserId(@Param("userId") Long userId);

    @Query("SELECT COALESCE(SUM(i.amount), 0.0) FROM Income i WHERE i.category.id = :categoryId")
    Double sumAmountByCategoryId(@Param("categoryId") Long categoryId);
}