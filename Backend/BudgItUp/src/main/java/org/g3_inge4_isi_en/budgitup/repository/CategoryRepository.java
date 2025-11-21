package org.g3_inge4_isi_en.budgitup.repository;

import org.g3_inge4_isi_en.budgitup.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    List<Category> findByIsDefaultTrue();
    List<Category> findByUserId(Long userId);
    Optional<Category> findByIdAndUserId(Long id, Long userId);
    boolean existsByNameIgnoreCase(String name);
}