package com.satishgupta.quizadda_server.models.quizPortal;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "questions")
public class Question {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long quesId;

    @Column(nullable = false, length = 5000)
    private String content;

    @Column(length = 500)
    private String image;

    @Column(nullable = false) private String option1;
    @Column(nullable = false) private String option2;
    @Column(nullable = false) private String option3;
    @Column(nullable = false) private String option4;

    @Column(nullable = false)
    private String answer;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "quiz_id", nullable = false)
    private Quiz quiz;
}
