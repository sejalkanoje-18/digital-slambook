package com.slambook.digital_slambook.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FriendRequestDTO {

    @NotBlank(message = "Friend name is required")
    private String friendName;

    @NotBlank(message = "Relationship is required")
    private String relationship;

    private String profilePhotoUrl;

    @NotNull(message = "Friendship rating is required")
    @Min(value = 1, message = "Friendship rating must be at least 1")
    @Max(value = 10, message = "Friendship rating must be at most 10")
    private Integer friendshipRating;

    @NotNull(message = "Best friend status is required")
    private Boolean isBestFriend;

    private LocalDate friendshipStartDate;

    private String message;

    private String songName;

    private String songArtist;

    private String songUrl;

    private String songDedication;

    private String memoryPhotoUrl;

    private String memory;

    private java.util.List<PhotoDTO> memoryPhotos;


}
