package com.slambook.digital_slambook.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class SlamBookResponseDTO {

    private Long id;

    private String fullName;

    private String nickname;

    private String profilePhotoUrl;

    private LocalDate dateOfBirth;

    private String gender;

    private String favoriteColor;

    private String hobbies;

    private String aboutMe;

    private Integer friendshipRating;

    private Boolean isBestFriend;

    private LocalDate friendshipStartDate;

    private String songName;

    private String songArtist;

    private String songUrl;

    private String songDedication;

    private String memoryPhotoUrl;

    private String memoryText;

    private java.util.List<PhotoDTO> memoryPhotos;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;



}


