package com.satishgupta.quizadda_server.models.quizPortal;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
public class Question {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long quesId;

    @Column(length = 5000)
    private String content;

    private String image;

    private String option1;
    private String option2;
    private String option3;
    private String option4;

    private String answer;

    @ManyToOne(fetch = FetchType.EAGER)
    private Quiz quiz;
}
