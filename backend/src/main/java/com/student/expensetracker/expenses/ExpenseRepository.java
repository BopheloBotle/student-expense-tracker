package com.student.expensetracker.expenses;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {
	List<Expense> findAllByUserIdOrderByDateDescIdDesc(Long userId);

	Optional<Expense> findByIdAndUserId(Long id, Long userId);

	@Query(
			"""
			select coalesce(sum(e.amount), 0)
			from Expense e
			where e.user.id = :userId and e.date between :start and :end
			""")
	java.math.BigDecimal sumForUserBetween(
			@Param("userId") Long userId, @Param("start") LocalDate start, @Param("end") LocalDate end);

	@Query(
			"""
			select c.name, coalesce(sum(e.amount), 0)
			from Expense e
			left join e.category c
			where e.user.id = :userId and e.date between :start and :end
			group by c.name
			order by coalesce(sum(e.amount), 0) desc
			""")
	List<Object[]> totalsByCategoryBetween(
			@Param("userId") Long userId, @Param("start") LocalDate start, @Param("end") LocalDate end);
}

