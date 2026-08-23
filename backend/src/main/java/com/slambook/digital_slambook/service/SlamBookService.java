package com.slambook.digital_slambook.service;

import com.slambook.digital_slambook.dto.SlamBookRequestDTO;
import com.slambook.digital_slambook.dto.SlamBookResponseDTO;
import com.slambook.digital_slambook.entity.SlamBook;
import com.slambook.digital_slambook.exception.ResourceNotFoundException;
import com.slambook.digital_slambook.repository.FriendRepository;
import com.slambook.digital_slambook.repository.SlamBookRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SlamBookService {

    private final SlamBookRepository slamBookRepository;
    private final FriendRepository friendRepository;

    public List<SlamBookResponseDTO> getAllSlamBooks() {
        return slamBookRepository.findAll().stream()
                .map(this::mapToResponse)
                .toList();
    }

    public SlamBookResponseDTO createSlamBook(SlamBookRequestDTO requestDTO) {

        SlamBook slamBook = new SlamBook();

        slamBook.setFullName(requestDTO.getFullName());
        slamBook.setNickname(requestDTO.getNickname());
        slamBook.setProfilePhotoUrl(requestDTO.getProfilePhotoUrl());
        slamBook.setDateOfBirth(requestDTO.getDateOfBirth());
        slamBook.setGender(requestDTO.getGender());
        slamBook.setFavoriteColor(requestDTO.getFavoriteColor());
        slamBook.setHobbies(requestDTO.getHobbies());
        slamBook.setAboutMe(requestDTO.getAboutMe());
        slamBook.setFriendshipRating(requestDTO.getFriendshipRating());
        slamBook.setIsBestFriend(requestDTO.getIsBestFriend());
        slamBook.setFriendshipStartDate(requestDTO.getFriendshipStartDate());
        slamBook.setSongName(requestDTO.getSongName());
        slamBook.setSongArtist(requestDTO.getSongArtist());
        slamBook.setSongUrl(requestDTO.getSongUrl());
        slamBook.setSongDedication(requestDTO.getSongDedication());
        slamBook.setMemoryPhotoUrl(requestDTO.getMemoryPhotoUrl());
        slamBook.setMemoryText(requestDTO.getMemoryText());
        if (requestDTO.getMemoryPhotos() != null) {
            for (com.slambook.digital_slambook.dto.PhotoDTO photoDto : requestDTO.getMemoryPhotos()) {
                com.slambook.digital_slambook.entity.MemoryPhoto photo = com.slambook.digital_slambook.entity.MemoryPhoto.builder()
                        .url(photoDto.getUrl())
                        .caption(photoDto.getCaption())
                        .slamBook(slamBook)
                        .build();
                slamBook.getMemoryPhotos().add(photo);
            }
        }

        SlamBook savedSlamBook = slamBookRepository.save(slamBook);

        return mapToResponse(savedSlamBook);
    }

    public SlamBookResponseDTO getSlamBookById(Long id){

        SlamBook slamBook = slamBookRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException( "The requested SLAM Book could not be found."));

        return mapToResponse(slamBook);
    }

    public SlamBookResponseDTO updateSlamBook(Long id, SlamBookRequestDTO requestDTO) {

        SlamBook slamBook = slamBookRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("The requested SLAM Book could not be found."));

        slamBook.setFullName(requestDTO.getFullName());
        slamBook.setNickname(requestDTO.getNickname());
        slamBook.setProfilePhotoUrl(requestDTO.getProfilePhotoUrl());
        slamBook.setDateOfBirth(requestDTO.getDateOfBirth());
        slamBook.setGender(requestDTO.getGender());
        slamBook.setFavoriteColor(requestDTO.getFavoriteColor());
        slamBook.setHobbies(requestDTO.getHobbies());
        slamBook.setAboutMe(requestDTO.getAboutMe());
        slamBook.setFriendshipRating(requestDTO.getFriendshipRating());
        slamBook.setIsBestFriend(requestDTO.getIsBestFriend());
        slamBook.setFriendshipStartDate(requestDTO.getFriendshipStartDate());
        slamBook.setSongName(requestDTO.getSongName());
        slamBook.setSongArtist(requestDTO.getSongArtist());
        slamBook.setSongUrl(requestDTO.getSongUrl());
        slamBook.setSongDedication(requestDTO.getSongDedication());
        slamBook.setMemoryPhotoUrl(requestDTO.getMemoryPhotoUrl());
        slamBook.setMemoryText(requestDTO.getMemoryText());
        if (requestDTO.getMemoryPhotos() != null) {
            slamBook.getMemoryPhotos().clear();
            for (com.slambook.digital_slambook.dto.PhotoDTO photoDto : requestDTO.getMemoryPhotos()) {
                com.slambook.digital_slambook.entity.MemoryPhoto photo = com.slambook.digital_slambook.entity.MemoryPhoto.builder()
                        .url(photoDto.getUrl())
                        .caption(photoDto.getCaption())
                        .slamBook(slamBook)
                        .build();
                slamBook.getMemoryPhotos().add(photo);
            }
        }

        SlamBook updatedSlamBook = slamBookRepository.save(slamBook);

        return mapToResponse(updatedSlamBook);
    }

    @Transactional
    public void deleteSlamBook(Long id) {

        SlamBook slamBook = slamBookRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "The requested SLAM Book could not be found."
                        ));

        friendRepository.deleteAll(friendRepository.findBySlamBook_Id(id));

        slamBookRepository.delete(slamBook);
    }


    private SlamBookResponseDTO mapToResponse(SlamBook slamBook) {

        return SlamBookResponseDTO.builder()
                .id(slamBook.getId())
                .fullName(slamBook.getFullName())
                .nickname(slamBook.getNickname())
                .profilePhotoUrl(slamBook.getProfilePhotoUrl())
                .dateOfBirth(slamBook.getDateOfBirth())
                .gender(slamBook.getGender())
                .favoriteColor(slamBook.getFavoriteColor())
                .hobbies(slamBook.getHobbies())
                .aboutMe(slamBook.getAboutMe())
                .friendshipRating(slamBook.getFriendshipRating())
                .isBestFriend(slamBook.getIsBestFriend())
                .friendshipStartDate(slamBook.getFriendshipStartDate())
                .songName(slamBook.getSongName())
                .songArtist(slamBook.getSongArtist())
                .songUrl(slamBook.getSongUrl())
                .songDedication(slamBook.getSongDedication())
                .memoryPhotoUrl(slamBook.getMemoryPhotoUrl())
                .memoryText(slamBook.getMemoryText())
                .memoryPhotos(slamBook.getMemoryPhotos() != null ? slamBook.getMemoryPhotos().stream()
                        .map(photo -> com.slambook.digital_slambook.dto.PhotoDTO.builder()
                                .url(photo.getUrl())
                                .caption(photo.getCaption())
                                .build())
                        .toList() : java.util.Collections.emptyList())
                .createdAt(slamBook.getCreatedAt())
                .updatedAt(slamBook.getUpdatedAt())
                .build();

    }
}
