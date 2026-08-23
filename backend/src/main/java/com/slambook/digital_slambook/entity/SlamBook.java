package com.slambook.digital_slambook.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "slam_book")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SlamBook {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(name = "nickname")
    private String nickname;

    @Column(name = "profile_photo_url")
    private String profilePhotoUrl;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Column(name = "gender")
    private String gender;

    @Column(name = "favorite_color")
    private String favoriteColor;

    @Column(name = "hobbies")
    private String hobbies;

    @Column(name = "about_me" , length = 500)
    private String aboutMe;

    @Column(name = "friendship_rating")
    private Integer friendshipRating;

    @Column(name = "is_best_friend")
    private Boolean isBestFriend;

    @Column(name = "friendship_start_date")
    private LocalDate friendshipStartDate;

    @Column(name = "song_name")
    private String songName;

    @Column(name = "song_artist")
    private String songArtist;

    @Column(name = "song_url")
    private String songUrl;

    @Column(name = "song_dedication", length = 500)
    private String songDedication;

    @Column(name = "memory_photo_url")
    private String memoryPhotoUrl;

    @Column(name = "memory_text", length = 1000)
    private String memoryText;

    @OneToMany(mappedBy = "slamBook", cascade = CascadeType.ALL, orphanRemoval = true)
    private java.util.List<MemoryPhoto> memoryPhotos = new java.util.ArrayList<>();

    @OneToMany(mappedBy = "slamBook", cascade = CascadeType.ALL, orphanRemoval = true)
    @lombok.ToString.Exclude
    @lombok.EqualsAndHashCode.Exclude
    private java.util.List<Friend> friends = new java.util.ArrayList<>();

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }



}
