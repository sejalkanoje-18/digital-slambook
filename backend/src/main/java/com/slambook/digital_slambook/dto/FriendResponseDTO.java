package com.slambook.digital_slambook.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FriendResponseDTO {

    private Long id;

    private String friendName;

    private String relationship;

    private String profilePhotoUrl;

    private Integer friendshipRating;

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

    private Long slamBookId;


}
