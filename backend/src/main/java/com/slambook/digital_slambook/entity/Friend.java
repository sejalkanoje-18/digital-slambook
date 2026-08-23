package com.slambook.digital_slambook.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "friends")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Friend {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String friendName;

    private String relationship;

    @Column(name = "profile_photo_url")
    private String profilePhotoUrl;

    private Integer friendshipRating;

    private Boolean isBestFriend;

    private LocalDate friendshipStartDate;

    @Column(length = 500)
    private String message;

    private String songName;

    private String songArtist;

    private String songUrl;

    @Column(length = 500)
    private String songDedication;

    private String memoryPhotoUrl;

    @Column(length = 500)
    private String memory;

    @OneToMany(mappedBy = "friend", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private java.util.List<MemoryPhoto> memoryPhotos = new java.util.ArrayList<>();

    @ManyToOne
    @JoinColumn(name = "slam_book_id", nullable = false)
    private SlamBook slamBook;

}
