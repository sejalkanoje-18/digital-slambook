package com.slambook.digital_slambook.service;

import com.slambook.digital_slambook.dto.FriendRequestDTO;
import com.slambook.digital_slambook.dto.FriendResponseDTO;
import com.slambook.digital_slambook.dto.PhotoDTO;
import com.slambook.digital_slambook.entity.Friend;
import com.slambook.digital_slambook.entity.MemoryPhoto;
import com.slambook.digital_slambook.entity.SlamBook;
import com.slambook.digital_slambook.exception.ResourceNotFoundException;
import com.slambook.digital_slambook.repository.FriendRepository;
import com.slambook.digital_slambook.repository.SlamBookRepository;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class FriendService {

    private final FriendRepository friendRepository;
    private final SlamBookRepository slamBookRepository;

    public FriendService(FriendRepository friendRepository, SlamBookRepository slamBookRepository) {
        this.friendRepository = friendRepository;
        this.slamBookRepository = slamBookRepository;
    }

    public FriendResponseDTO createFriend(Long slamId, FriendRequestDTO request) {

        SlamBook slamBook = slamBookRepository.findById(slamId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("SlamBook not found with id " + slamId));

        Friend friend = Friend.builder()
                .friendName(request.getFriendName())
                .relationship(request.getRelationship())
                .profilePhotoUrl(request.getProfilePhotoUrl())
                .friendshipRating(request.getFriendshipRating())
                .isBestFriend(request.getIsBestFriend())
                .friendshipStartDate(request.getFriendshipStartDate())
                .message(request.getMessage())
                .songName(request.getSongName())
                .songArtist(request.getSongArtist())
                .songUrl(request.getSongUrl())
                .songDedication(request.getSongDedication())
                .memoryPhotoUrl(request.getMemoryPhotoUrl())
                .memory(request.getMemory())
                .slamBook(slamBook)
                .build();
        if (friend.getMemoryPhotos() == null) {
            friend.setMemoryPhotos(new ArrayList<>());
        }
        slamBook.getFriends().add(friend);

        // Map multiple memory photos
        if (request.getMemoryPhotos() != null) {
            for (PhotoDTO photoDto : request.getMemoryPhotos()) {
                MemoryPhoto photo = MemoryPhoto.builder()
                        .url(photoDto.getUrl())
                        .caption(photoDto.getCaption())
                        .friend(friend)
                        .build();
                friend.getMemoryPhotos().add(photo);
            }
        }

        Friend savedFriend = friendRepository.save(friend);

        return mapToResponse(savedFriend, slamBook.getId());
    }

    public List<FriendResponseDTO> getFriendsBySlamBookId(Long slamId) {

        slamBookRepository.findById(slamId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("SlamBook not found with id " + slamId));

        List<Friend> friends = friendRepository.findBySlamBook_Id(slamId);

        return friends.stream()
                .map(friend -> mapToResponse(friend, friend.getSlamBook().getId()))
                .collect(Collectors.toList());
    }

    public FriendResponseDTO updateFriend(Long friendId, FriendRequestDTO request) {

        Friend friend = friendRepository.findById(friendId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Friend not found with id " + friendId));

        friend.setFriendName(request.getFriendName());
        friend.setRelationship(request.getRelationship());
        friend.setProfilePhotoUrl(request.getProfilePhotoUrl());
        friend.setFriendshipRating(request.getFriendshipRating());
        friend.setIsBestFriend(request.getIsBestFriend());
        friend.setFriendshipStartDate(request.getFriendshipStartDate());
        friend.setMessage(request.getMessage());
        friend.setSongName(request.getSongName());
        friend.setSongArtist(request.getSongArtist());
        friend.setSongUrl(request.getSongUrl());
        friend.setSongDedication(request.getSongDedication());
        friend.setMemoryPhotoUrl(request.getMemoryPhotoUrl());
        friend.setMemory(request.getMemory());

        // Replace memory photos
        if (request.getMemoryPhotos() != null) {
                        if (friend.getMemoryPhotos() == null) {
                                friend.setMemoryPhotos(new ArrayList<>());
                        }
            friend.getMemoryPhotos().clear();
            for (PhotoDTO photoDto : request.getMemoryPhotos()) {
                MemoryPhoto photo = MemoryPhoto.builder()
                        .url(photoDto.getUrl())
                        .caption(photoDto.getCaption())
                        .friend(friend)
                        .build();
                friend.getMemoryPhotos().add(photo);
            }
        }

        Friend updatedFriend = friendRepository.save(friend);

        return mapToResponse(updatedFriend, updatedFriend.getSlamBook().getId());
    }

    public void deleteFriend(Long friendId) {

        Friend friend = friendRepository.findById(friendId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Friend not found with id " + friendId));

        friendRepository.delete(friend);
    }

    private FriendResponseDTO mapToResponse(Friend friend, Long slamBookId) {
        List<PhotoDTO> photos = friend.getMemoryPhotos() != null
                ? friend.getMemoryPhotos().stream()
                        .map(p -> PhotoDTO.builder()
                                .url(p.getUrl())
                                .caption(p.getCaption())
                                .build())
                        .collect(Collectors.toList())
                : Collections.emptyList();

        return FriendResponseDTO.builder()
                .id(friend.getId())
                .friendName(friend.getFriendName())
                .relationship(friend.getRelationship())
                .profilePhotoUrl(friend.getProfilePhotoUrl())
                .friendshipRating(friend.getFriendshipRating())
                .isBestFriend(friend.getIsBestFriend())
                .friendshipStartDate(friend.getFriendshipStartDate())
                .message(friend.getMessage())
                .songName(friend.getSongName())
                .songArtist(friend.getSongArtist())
                .songUrl(friend.getSongUrl())
                .songDedication(friend.getSongDedication())
                .memoryPhotoUrl(friend.getMemoryPhotoUrl())
                .memory(friend.getMemory())
                .memoryPhotos(photos)
                .slamBookId(slamBookId)
                .build();
    }
}
