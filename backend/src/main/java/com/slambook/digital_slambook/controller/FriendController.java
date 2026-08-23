package com.slambook.digital_slambook.controller;

import com.slambook.digital_slambook.dto.FriendRequestDTO;
import com.slambook.digital_slambook.dto.FriendResponseDTO;
import com.slambook.digital_slambook.service.FriendService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class FriendController {

    private final FriendService friendService;

    public FriendController(FriendService friendService) {
        this.friendService = friendService;
    }

    @PostMapping("/slam/{slamId}/friends")
    public ResponseEntity<FriendResponseDTO> createFriend(
            @PathVariable Long slamId,
            @Valid @RequestBody FriendRequestDTO request) {

        FriendResponseDTO response = friendService.createFriend(slamId, request);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/slam/{slamId}/friends")
    public ResponseEntity<List<FriendResponseDTO>> getFriends(
            @PathVariable Long slamId) {

        List<FriendResponseDTO> response = friendService.getFriendsBySlamBookId(slamId);

        return ResponseEntity.ok(response);
    }

    @PutMapping("/friends/{friendId}")
    public ResponseEntity<FriendResponseDTO> updateFriend(
            @PathVariable Long friendId,
            @Valid @RequestBody FriendRequestDTO request) {

        FriendResponseDTO response = friendService.updateFriend(friendId, request);

        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/friends/{friendId}")
    public ResponseEntity<String> deleteFriend(
            @PathVariable Long friendId) {

        friendService.deleteFriend(friendId);

        return ResponseEntity.ok("Friend deleted successfully.");
    }

}
