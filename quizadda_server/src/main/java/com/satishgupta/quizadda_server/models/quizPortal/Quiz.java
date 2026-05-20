package com.satishgupta.quizadda_server.models.quizPortal;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "quizzes")
public class Quiz {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long quizId;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(length = 1000)
    private String description;

    @Column(nullable = false, length = 20)
    private String maxMarks;

    @Column(nullable = false, length = 20)
    private String numberOfQuestions;

    @Column(nullable = false)
    private boolean active = false;

    /**
     * Difficulty band shown to users. Defaults to MEDIUM so existing rows
     * without a value behave sensibly after the column is added.
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private Difficulty difficulty = Difficulty.MEDIUM;

    /**
     * Free-form tags ("javascript", "history", "fast"). Persisted as a
     * separate {@code quiz_tags} table because tags are queried per-tag and
     * may be large.
     */
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "quiz_tags",
            joinColumns = @JoinColumn(name = "quiz_id"),
            indexes = @Index(name = "idx_quiz_tags_tag", columnList = "tag"))
    @Column(name = "tag", length = 40)
    private Set<String> tags = new LinkedHashSet<>();

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @OneToMany(mappedBy = "quiz", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private Set<Question> questions = new HashSet<>();
}
