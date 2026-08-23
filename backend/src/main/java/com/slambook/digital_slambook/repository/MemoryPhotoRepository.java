package com.slambook.digital_slambook.repository;

import com.slambook.digital_slambook.entity.MemoryPhoto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MemoryPhotoRepository extends JpaRepository<MemoryPhoto, Long> {

    List<MemoryPhoto> findBySlamBook_Id(Long slamBookId);

    List<MemoryPhoto> findByFriend_Id(Long friendId);
}
