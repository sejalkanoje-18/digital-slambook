package com.slambook.digital_slambook.repository;

import com.slambook.digital_slambook.entity.SlamBook;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SlamBookRepository extends JpaRepository<SlamBook, Long> {
}
