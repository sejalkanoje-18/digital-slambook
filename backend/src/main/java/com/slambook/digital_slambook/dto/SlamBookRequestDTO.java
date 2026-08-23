package com.slambook.digital_slambook.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDate;

@Data
public class SlamBookRequestDTO {

    @NotBlank(message = "Full name is required")
    private String fullName;

    private String nickname;

    private String profilePhotoUrl;

    private LocalDate dateOfBirth;

    private String gender;

    private String favoriteColor;

    private String hobbies;

    @Size(max = 500, message = "About me must be less than or equal to 500 characters")
    private String aboutMe;

    @Min(value = 1, message = "Friendship rating must be between 1 and 10")
    @Max(value = 10, message = "Friendship rating must be between 1 and 10")
    private Integer friendshipRating;

    private Boolean isBestFriend;

    private LocalDate friendshipStartDate;

    private String songName;

    private String songArtist;

    private String songUrl;

    @Size(max = 500, message = "Song dedication must be less than or equal to 500 characters")
    private String songDedication;

    private String memoryPhotoUrl;

    @Size(max = 500, message = "Memory text must be less than or equal to 500 characters")
    private String memoryText;

    private java.util.List<PhotoDTO> memoryPhotos;



}
