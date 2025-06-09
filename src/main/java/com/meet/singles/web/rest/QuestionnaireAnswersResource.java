package com.meet.singles.web.rest;

import com.meet.singles.domain.PersonProfile;
import com.meet.singles.domain.TestQuestion;
import com.meet.singles.domain.User;
import com.meet.singles.domain.UserTestAnswer;
import com.meet.singles.repository.PersonProfileRepository;
import com.meet.singles.repository.TestQuestionRepository;
import com.meet.singles.repository.UserRepository;
import com.meet.singles.repository.UserTestAnswerRepository;
import com.meet.singles.security.SecurityUtils;
import jakarta.validation.Valid;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Map;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for managing questionnaire answers.
 */
@RestController
@RequestMapping("/api")
public class QuestionnaireAnswersResource {

    private static final Logger log = LoggerFactory.getLogger(QuestionnaireAnswersResource.class);

    private final UserTestAnswerRepository userTestAnswerRepository;
    private final TestQuestionRepository testQuestionRepository;
    private final PersonProfileRepository personProfileRepository;
    private final UserRepository userRepository;

    public QuestionnaireAnswersResource(
        UserTestAnswerRepository userTestAnswerRepository,
        TestQuestionRepository testQuestionRepository,
        PersonProfileRepository personProfileRepository,
        UserRepository userRepository
    ) {
        this.userTestAnswerRepository = userTestAnswerRepository;
        this.testQuestionRepository = testQuestionRepository;
        this.personProfileRepository = personProfileRepository;
        this.userRepository = userRepository;
    }

    /**
     * {@code POST  /questionnaire-answers} : Save questionnaire answers for the current user.
     *
     * @param answers the questionnaire answers to save
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and success message
     */
    @PostMapping("/questionnaire-answers")
    public ResponseEntity<Map<String, String>> saveQuestionnaireAnswers(@Valid @RequestBody Map<String, Object> answers) {
        log.debug("REST request to save questionnaire answers: {}", answers);

        // Get current user
        Optional<String> currentUserLogin = SecurityUtils.getCurrentUserLogin();
        if (currentUserLogin.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "User not authenticated"));
        }

        // Find or create person profile for current user
        PersonProfile personProfile = personProfileRepository
            .findByInternalUserLogin(currentUserLogin.get())
            .orElseGet(() -> {
                // Create a new PersonProfile for the user
                Optional<User> userOpt = userRepository.findOneByLogin(currentUserLogin.get());
                if (userOpt.isEmpty()) {
                    throw new RuntimeException("User not found: " + currentUserLogin.get());
                }
                
                User user = userOpt.get();
                PersonProfile newProfile = new PersonProfile();
                newProfile.setInternalUser(user);
                // Set required fields with default values
                newProfile.setFirstName(user.getFirstName() != null ? user.getFirstName() : "");
                newProfile.setLastName(user.getLastName() != null ? user.getLastName() : "");
                newProfile.setDob(LocalDate.of(1990, 1, 1)); // Default date
                newProfile.setGender("Not specified"); // Default gender
                newProfile.setTestCompleted(false); // Default test not completed
                
                return personProfileRepository.save(newProfile);
            });

        // Save each answer
        for (Map.Entry<String, Object> entry : answers.entrySet()) {
            try {
                Long questionId = Long.parseLong(entry.getKey());
                Object answerValue = entry.getValue();

                Optional<TestQuestion> questionOpt = testQuestionRepository.findById(questionId);
                if (questionOpt.isPresent()) {
                    TestQuestion question = questionOpt.get();
                    
                    // Handle different answer types
                    Integer answerIntValue = null;
                    if (answerValue instanceof Number) {
                        answerIntValue = ((Number) answerValue).intValue();
                    } else if (answerValue instanceof String) {
                        try {
                            answerIntValue = Integer.parseInt((String) answerValue);
                        } catch (NumberFormatException e) {
                            log.warn("Could not parse answer value as integer: {}", answerValue);
                            continue;
                        }
                    }

                    if (answerIntValue != null) {
                        UserTestAnswer userAnswer = new UserTestAnswer();
                        userAnswer.setQuestion(question);
                        userAnswer.setPersonProfile(personProfile);
                        userAnswer.setAnswerValue(answerIntValue);
                        userAnswer.setTimestamp(Instant.now());

                        userTestAnswerRepository.save(userAnswer);
                    }
                }
            } catch (NumberFormatException e) {
                log.warn("Invalid question ID: {}", entry.getKey());
            }
        }

        // Mark test as completed
        personProfile.setTestCompleted(true);
        personProfileRepository.save(personProfile);

        log.info("Successfully saved questionnaire answers for user: {} and marked test as completed", currentUserLogin.get());
        return ResponseEntity.ok(Map.of("message", "Questionnaire answers saved successfully"));
    }
} 