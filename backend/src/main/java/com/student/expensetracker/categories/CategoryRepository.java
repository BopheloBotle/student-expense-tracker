package com.student.expensetracker.categories;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepository extends JpaRepository<Category, Long> {
	List<Category> findAllByUserIdOrderByNameAsc(Long userId);
	Optional<Category> findByIdAndUserId(Long id, Long userId);
	boolean existsByUserIdAndNameIgnoreCase(Long userId, String name);
}

