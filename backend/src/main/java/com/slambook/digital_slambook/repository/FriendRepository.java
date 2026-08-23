package com.slambook.digital_slambook.repository;

import com.slambook.digital_slambook.entity.Friend;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FriendRepository extends JpaRepository<Friend, Long> {

    List<Friend> findBySlamBook_Id(Long slamBookId);
}
