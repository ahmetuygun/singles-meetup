package com.meet.singles.web.rest;

import com.meet.singles.domain.PersonProfile;
import com.meet.singles.domain.TestQuestion;
import com.meet.singles.domain.TestAnswerOption;
import com.meet.singles.domain.User;
import com.meet.singles.domain.UserTestAnswer;
import com.meet.singles.domain.enumeration.QuestionType;
import com.meet.singles.domain.enumeration.CategoryType;
import com.meet.singles.repository.PersonProfileRepository;
import com.meet.singles.repository.TestQuestionRepository;
import com.meet.singles.repository.UserRepository;
import com.meet.singles.repository.UserTestAnswerRepository;
import com.meet.singles.security.SecurityUtils;
import jakarta.validation.Valid;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.EnumSet;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
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

    // Remove the hardcoded IDENTITY_CATEGORIES constant as we now use the editable field
    // private static final Set<CategoryType> IDENTITY_CATEGORIES = Set.of(
    //     CategoryType.USERNAME,
    //     CategoryType.DOB,
    //     CategoryType.GENDER
    // );

    private static final EnumSet<CategoryType> TEXT_ANSWER_CATEGORIES = EnumSet.of(
        CategoryType.JOB,
        CategoryType.DOB,
        CategoryType.USERNAME
        
    );

    // Question types that should be treated as text answers regardless of category
    private static final Set<QuestionType> TEXT_QUESTION_TYPES = Set.of(
        QuestionType.TEXT_INPUT,
        QuestionType.DATE_INPUT,
        QuestionType.COUNTRY_SELECTION,
        QuestionType.JOB_SELECTION
    );

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

    // DTO for question details with answer
    public static class QuestionAnswerDTO {
        private Long questionId;
        private String questionText;
        private QuestionType questionType;
        private CategoryType category;
        private List<OptionDTO> options;
        private Object answerValue; // Can be Integer, String, or List for multiple choice
        private Boolean editable; // Whether this question can be edited on retake
        
        // Constructors
        public QuestionAnswerDTO() {}
        
        public QuestionAnswerDTO(Long questionId, String questionText, QuestionType questionType, 
                               CategoryType category, List<OptionDTO> options, Object answerValue) {
            this.questionId = questionId;
            this.questionText = questionText;
            this.questionType = questionType;
            this.category = category;
            this.options = options;
            this.answerValue = answerValue;
        }
        
        public QuestionAnswerDTO(Long questionId, String questionText, QuestionType questionType, 
                               CategoryType category, List<OptionDTO> options, Object answerValue, Boolean editable) {
            this.questionId = questionId;
            this.questionText = questionText;
            this.questionType = questionType;
            this.category = category;
            this.options = options;
            this.answerValue = answerValue;
            this.editable = editable;
        }
        
        // Getters and setters
        public Long getQuestionId() { return questionId; }
        public void setQuestionId(Long questionId) { this.questionId = questionId; }
        
        public String getQuestionText() { return questionText; }
        public void setQuestionText(String questionText) { this.questionText = questionText; }
        
        public QuestionType getQuestionType() { return questionType; }
        public void setQuestionType(QuestionType questionType) { this.questionType = questionType; }
        
        public CategoryType getCategory() { return category; }
        public void setCategory(CategoryType category) { this.category = category; }
        
        public List<OptionDTO> getOptions() { return options; }
        public void setOptions(List<OptionDTO> options) { this.options = options; }
        
        public Object getAnswerValue() { return answerValue; }
        public void setAnswerValue(Object answerValue) { this.answerValue = answerValue; }
        
        public Boolean getEditable() { return editable; }
        public void setEditable(Boolean editable) { this.editable = editable; }
    }
    
    // DTO for answer options
    public static class OptionDTO {
        private Long id;
        private String optionText;
        private Integer value;
        
        public OptionDTO() {}
        
        public OptionDTO(Long id, String optionText, Integer value) {
            this.id = id;
            this.optionText = optionText;
            this.value = value;
        }
        
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        
        public String getOptionText() { return optionText; }
        public void setOptionText(String optionText) { this.optionText = optionText; }
        
        public Integer getValue() { return value; }
        public void setValue(Integer value) { this.value = value; }
    }

    // Request DTO for the new API
    public static class QuestionnaireSubmissionDTO {
        private List<QuestionAnswerDTO> questions;
        
        public QuestionnaireSubmissionDTO() {}
        
        public List<QuestionAnswerDTO> getQuestions() { return questions; }
        public void setQuestions(List<QuestionAnswerDTO> questions) { this.questions = questions; }
    }

    // Helper class for profile fields
    private static class ProfileFields {
        String firstName;
        String lastName;
        LocalDate dob;
        String gender;
        boolean hasAllRequired() {
            return firstName != null && lastName != null && dob != null && gender != null;
        }
    }

    // Helper to extract profile fields from question answers
    private ProfileFields extractProfileFieldsFromQuestions(List<QuestionAnswerDTO> questions) {
        ProfileFields fields = new ProfileFields();
        
        for (QuestionAnswerDTO questionAnswer : questions) {
            if (questionAnswer.getCategory() == null || questionAnswer.getAnswerValue() == null) continue;
            
            Object answerValue = questionAnswer.getAnswerValue();
            String strValue = parseStringValue(answerValue);

            switch (questionAnswer.getCategory()) {
                case USERNAME -> {
                    if (strValue != null && !strValue.isBlank()) {
                        String[] parts = strValue.trim().split("\\s+", 2);
                        fields.firstName = parts[0];
                        fields.lastName = (parts.length > 1) ? parts[1] : "";
                    }
                }
                case DOB -> {
                    if (strValue != null) {
                        try {
                            fields.dob = LocalDate.parse(strValue);
                        } catch (Exception e) {
                            log.warn("Could not parse DOB: {}", strValue);
                        }
                    }
                }
                case GENDER -> {
                    // Gender comes as option value (1, 2, etc.) not option ID
                    final Integer optionValue;
                    if (answerValue instanceof Number) {
                        optionValue = ((Number) answerValue).intValue();
                    } else if (answerValue instanceof String s) {
                        Integer parsed = null;
                        try {
                            parsed = Integer.parseInt(s);
                        } catch (NumberFormatException e) {
                            log.warn("Could not parse gender option value: {}", s);
                        }
                        optionValue = parsed;
                    } else {
                        optionValue = null;
                    }
                    if (optionValue != null && questionAnswer.getOptions() != null) {
                        questionAnswer.getOptions().stream()
                            .filter(opt -> opt.getValue().equals(optionValue))  // Match by value, not ID
                            .findFirst()
                            .ifPresent(opt -> fields.gender = opt.getOptionText());
                    }
                }
                default -> {}
            }
        }
        return fields;
    }

    // Helper to build and save a new PersonProfile
    private PersonProfile buildAndSaveProfile(ProfileFields fields, String userLogin) {
        if (!fields.hasAllRequired()) {
            throw new IllegalArgumentException("Missing required profile fields");
        }
        Optional<User> userOpt = userRepository.findOneByLogin(userLogin);
        if (userOpt.isEmpty()) {
            throw new IllegalArgumentException("User not found");
        }
        User user = userOpt.get();
        PersonProfile personProfile = new PersonProfile();
        personProfile.setInternalUser(user);
        personProfile.setFirstName(fields.firstName);
        personProfile.setLastName(fields.lastName);
        personProfile.setDob(fields.dob);
        personProfile.setGender(fields.gender);
        personProfile.setTestCompleted(false);
        return personProfileRepository.save(personProfile);
    }



    /**
     * Saves UserTestAnswer entities for the given question answers and profile.
     * On retake, skips saving answers for non-editable questions.
     */
    private void saveUserTestAnswersFromQuestions(List<QuestionAnswerDTO> questions, PersonProfile personProfile) {
        boolean isFirstTestAttempt = personProfile.getTestCompleted() == null || !personProfile.getTestCompleted();
        log.debug("Saving answers for {} questions, isFirstTestAttempt: {}", questions.size(), isFirstTestAttempt);

        for (QuestionAnswerDTO questionAnswer : questions) {
            if (questionAnswer.getQuestionId() == null || questionAnswer.getAnswerValue() == null) {
                log.debug("Skipping question {} - missing questionId or answerValue", questionAnswer.getQuestionId());
                continue;
            }

            // On retake, skip non-editable questions
            if (!isFirstTestAttempt && Boolean.FALSE.equals(questionAnswer.getEditable())) {
                log.debug("Skipping non-editable question {} on retake", questionAnswer.getQuestionId());
                continue;
            }

            // Create a minimal TestQuestion object for saving the answer
            TestQuestion question = new TestQuestion();
            question.setId(questionAnswer.getQuestionId());
            question.setQuestionText(questionAnswer.getQuestionText());
            question.setQuestionType(questionAnswer.getQuestionType());
            question.setCategory(questionAnswer.getCategory());

            // Check if this should be treated as a text answer (by category or question type)
            boolean isTextAnswer = TEXT_ANSWER_CATEGORIES.contains(questionAnswer.getCategory()) || 
                                 TEXT_QUESTION_TYPES.contains(questionAnswer.getQuestionType());
            
            log.debug("Processing question {} ({}), category: {}, type: {}, isTextAnswer: {}, answerValue: {}", 
                     questionAnswer.getQuestionId(), questionAnswer.getQuestionText(), 
                     questionAnswer.getCategory(), questionAnswer.getQuestionType(), 
                     isTextAnswer, questionAnswer.getAnswerValue());
            
            if (isTextAnswer) {
                String strValue = parseStringValue(questionAnswer.getAnswerValue());
                if (strValue == null || strValue.trim().isEmpty()) {
                    log.warn("Skipping empty text answer for question {}", questionAnswer.getQuestionId());
                    continue;
                }
                log.debug("Saving text answer: {}", strValue);
                saveUserTestAnswer(personProfile, question, null, strValue);
            } else {
                Integer answerIntValue = parseAnswerValue(questionAnswer.getAnswerValue());
                if (answerIntValue == null) {
                    log.warn("Skipping invalid answer value for question {}: {}", questionAnswer.getQuestionId(), questionAnswer.getAnswerValue());
                    continue;
                }
                log.debug("Saving numeric answer: {}", answerIntValue);
                saveUserTestAnswer(personProfile, question, answerIntValue, null);
            }
        }
        log.debug("Finished saving answers");
    }

    /** Helper to create and save a UserTestAnswer. */
    private void saveUserTestAnswer(PersonProfile profile, TestQuestion question, Integer answerValue, String answerText) {
        UserTestAnswer userAnswer = new UserTestAnswer();
        userAnswer.setQuestion(question);
        userAnswer.setPersonProfile(profile);
        userAnswer.setTimestamp(Instant.now());
        userAnswer.setAnswerValue(answerValue);
        userAnswer.setAnswerText(answerText);
        userTestAnswerRepository.save(userAnswer);
    }

    /** Helper to parse a value as String, returns null if not possible. */
    private String parseStringValue(Object value) {
        return (value instanceof String s) ? s : null;
    }

    /** Helper to parse a value as Integer, returns null if not possible. */
    private Integer parseAnswerValue(Object answerValue) {
        if (answerValue instanceof Number) {
            return ((Number) answerValue).intValue();
        } else if (answerValue instanceof String) {
            try {
                return Integer.parseInt((String) answerValue);
            } catch (NumberFormatException e) {
                log.warn("Could not parse answer value as integer: {}", answerValue);
            }
        }
        return null;
    }

    /** Helper to parse a String as Long, returns null if not possible. */
    private Long parseLongOrNull(String value) {
        try {
            return Long.parseLong(value);
        } catch (NumberFormatException e) {
            log.warn("Invalid question ID: {}", value);
            return null;
        }
    }

    // Helper to get or create PersonProfile
    private PersonProfile getOrCreateProfile(String userLogin, ProfileFields fields) {
        Optional<PersonProfile> existingProfile = personProfileRepository.findByInternalUserLogin(userLogin);
        
        if (existingProfile.isPresent()) {
            PersonProfile profile = existingProfile.get();
            // Update profile with questionnaire data if we have valid fields
            if (fields.hasAllRequired()) {
                log.debug("Updating existing profile with questionnaire data for user: {}", userLogin);
                profile.setFirstName(fields.firstName);
                profile.setLastName(fields.lastName);
                profile.setDob(fields.dob);
                profile.setGender(fields.gender);
                return personProfileRepository.save(profile);
            }
            return profile;
        } else {
            // Create new profile
            return buildAndSaveProfile(fields, userLogin);
        }
    }

    private PersonProfile getOrCreateProfileForRetake(String userLogin, ProfileFields fields, boolean isRetake) {
        Optional<PersonProfile> existingProfile = personProfileRepository.findByInternalUserLogin(userLogin);
        
        if (existingProfile.isPresent()) {
            PersonProfile profile = existingProfile.get();
            
            if (isRetake && Boolean.TRUE.equals(profile.getTestCompleted())) {
                // For retake, do NOT update identity fields (firstName, lastName, dob, gender)
                log.debug("Retake detected - preserving existing identity fields for user: {}", userLogin);
                return profile;
            } else {
                // First time or not a retake - update profile with questionnaire data if we have valid fields
                if (fields.hasAllRequired()) {
                    log.debug("Updating existing profile with questionnaire data for user: {}", userLogin);
                    profile.setFirstName(fields.firstName);
                    profile.setLastName(fields.lastName);
                    profile.setDob(fields.dob);
                    profile.setGender(fields.gender);
                    return personProfileRepository.save(profile);
                }
                return profile;
            }
        } else {
            // Create new profile
            return buildAndSaveProfile(fields, userLogin);
        }
    }

    /**
     * {@code POST  /questionnaire-answers-v2} : Save questionnaire answers with question details for the current user.
     * This new endpoint accepts question details along with answers to reduce database calls.
     *
     * @param retake the retake flag
     * @param submission the questionnaire submission containing questions and answers
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and success message
     */
    @PostMapping("/questionnaire-answers-v2")
    @Transactional
    public ResponseEntity<Map<String, String>> saveQuestionnaireAnswersV2(
        @RequestParam(value = "retake", required = false, defaultValue = "false") boolean retake,
        @Valid @RequestBody QuestionnaireSubmissionDTO submission
    ) {
        log.debug("REST request to save questionnaire answers v2: {} questions (retake={})", 
                 submission.getQuestions() != null ? submission.getQuestions().size() : 0, retake);

        Optional<String> currentUserLogin = SecurityUtils.getCurrentUserLogin();
        if (currentUserLogin.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "User not authenticated"));
        }
        String userLogin = currentUserLogin.get();

        if (submission.getQuestions() == null || submission.getQuestions().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "No questions provided"));
        }

        // Extract profile fields from questions
        ProfileFields fields = extractProfileFieldsFromQuestions(submission.getQuestions());
        log.debug("Extracted profile fields - firstName: {}, lastName: {}, dob: {}, gender: {}, hasAllRequired: {}", 
                 fields.firstName, fields.lastName, fields.dob, fields.gender, fields.hasAllRequired());

        // Get or create person profile for current user
        PersonProfile personProfile;
        try {
            personProfile = getOrCreateProfileForRetake(userLogin, fields, retake);
            log.debug("Profile after getOrCreate - firstName: {}, lastName: {}, dob: {}, gender: {}, testCompleted: {}", 
                     personProfile.getFirstName(), personProfile.getLastName(), personProfile.getDob(), 
                     personProfile.getGender(), personProfile.getTestCompleted());
        } catch (IllegalArgumentException e) {
            log.error("Error getting/creating profile: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }

        // If test already completed and not a retake, return a message
        if (Boolean.TRUE.equals(personProfile.getTestCompleted()) && !retake) {
            return ResponseEntity.status(409).body(Map.of("error", "Test already completed. Use retake option to overwrite."));
        }

        // If retake, delete old answers for editable questions only
        if (retake && Boolean.TRUE.equals(personProfile.getTestCompleted())) {
            // Use repository query instead of lazy-loaded collection
            List<UserTestAnswer> allAnswers = userTestAnswerRepository.findByPersonProfile(personProfile);
            List<UserTestAnswer> toDelete = allAnswers.stream()
                .filter(ans -> Boolean.TRUE.equals(ans.getQuestion().getEditable()))
                .toList();
            userTestAnswerRepository.deleteAll(toDelete);
            log.debug("Deleted {} old answers for retake (editable questions only)", toDelete.size());
        }

        // Save each answer using the helper
        log.debug("Starting to save {} question answers", submission.getQuestions().size());
        saveUserTestAnswersFromQuestions(submission.getQuestions(), personProfile);

        // Mark test as completed and save updated profile
        personProfile.setTestCompleted(true);
        personProfileRepository.save(personProfile);
        log.debug("Marked test as completed for user: {}", userLogin);

        log.info("Successfully saved questionnaire answers v2 for user: {} and marked test as completed", userLogin);
        return ResponseEntity.ok(Map.of("message", "Questionnaire answers saved successfully"));
    }

    // Keep the old endpoint for backward compatibility
    
    // Helper to extract profile fields from answers (old format)
    private ProfileFields extractProfileFields(Map<String, Object> answers) {
        ProfileFields fields = new ProfileFields();
        for (Map.Entry<String, Object> entry : answers.entrySet()) {
            Long questionId;
            try {
                questionId = Long.parseLong(entry.getKey());
            } catch (NumberFormatException e) {
                log.warn("Invalid question ID: {}", entry.getKey());
                continue;
            }

            Optional<TestQuestion> questionOpt = testQuestionRepository.findById(questionId);
            if (questionOpt.isEmpty() || questionOpt.get().getCategory() == null) continue;

            TestQuestion question = questionOpt.get();
            Object answerValue = entry.getValue();
            String strValue = parseStringValue(answerValue);

            switch (question.getCategory()) {
                case USERNAME -> {
                    if (strValue != null && !strValue.isBlank()) {
                        String[] parts = strValue.trim().split("\\s+", 2);
                        fields.firstName = parts[0];
                        fields.lastName = (parts.length > 1) ? parts[1] : "";
                    }
                }
                case DOB -> {
                    if (strValue != null) {
                        try {
                            fields.dob = LocalDate.parse(strValue);
                        } catch (Exception e) {
                            log.warn("Could not parse DOB: {}", strValue);
                        }
                    }
                }
                case GENDER -> {
                    // Gender comes as option value (1, 2, etc.) not option ID
                    final Integer optionValue;
                    if (answerValue instanceof Number) {
                        optionValue = ((Number) answerValue).intValue();
                    } else if (answerValue instanceof String s) {
                        Integer parsed = null;
                        try {
                            parsed = Integer.parseInt(s);
                        } catch (NumberFormatException e) {
                            log.warn("Could not parse gender option value: {}", s);
                        }
                        optionValue = parsed;
                    } else {
                        optionValue = null;
                    }
                    if (optionValue != null && question.getOptions() != null) {
                        question.getOptions().stream()
                            .filter(opt -> opt.getValue().equals(optionValue))  // Match by value, not ID
                            .findFirst()
                            .ifPresent(opt -> fields.gender = opt.getOptionText());
                    }
                }
                default -> {}
            }
        }
        return fields;
    }

    /**
     * Saves UserTestAnswer entities for the given answers and profile (old format).
     * On retake, skips saving answers for non-editable questions.
     */
    private void saveUserTestAnswers(Map<String, Object> answers, PersonProfile personProfile) {
        boolean isFirstTestAttempt = personProfile.getTestCompleted() == null || !personProfile.getTestCompleted();

        for (Map.Entry<String, Object> entry : answers.entrySet()) {
            Long questionId = parseLongOrNull(entry.getKey());
            if (questionId == null) continue;

            Optional<TestQuestion> questionOpt = testQuestionRepository.findById(questionId);
            if (questionOpt.isEmpty()) continue;

            TestQuestion question = questionOpt.get();

            // On retake, skip non-editable questions
            if (!isFirstTestAttempt && Boolean.FALSE.equals(question.getEditable())) {
                log.debug("Skipping non-editable question {} on retake", questionId);
                continue;
            }

            // Check if this should be treated as a text answer (by category or question type)
            boolean isTextAnswer = TEXT_ANSWER_CATEGORIES.contains(question.getCategory()) || 
                                 TEXT_QUESTION_TYPES.contains(question.getQuestionType());
            
            if (isTextAnswer) {
                String strValue = parseStringValue(entry.getValue());
                if (strValue == null || strValue.trim().isEmpty()) {
                    log.warn("Skipping empty text answer for question {}", questionId);
                    continue;
                }
                saveUserTestAnswer(personProfile, question, null, strValue);
            } else {
                Integer answerIntValue = parseAnswerValue(entry.getValue());
                if (answerIntValue == null) {
                    log.warn("Skipping invalid answer value for question {}: {}", questionId, entry.getValue());
                    continue;
                }
                saveUserTestAnswer(personProfile, question, answerIntValue, null);
            }
        }
    }

    /**
     * {@code POST  /questionnaire-answers} : Save questionnaire answers for the current user (legacy endpoint).
     *
     * @param retake the retake flag
     * @param answers the questionnaire answers to save
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and success message
     */
    @PostMapping("/questionnaire-answers")
    @Transactional
    public ResponseEntity<Map<String, String>> saveQuestionnaireAnswers(
        @RequestParam(value = "retake", required = false, defaultValue = "false") boolean retake,
        @Valid @RequestBody Map<String, Object> answers
    ) {
        log.debug("REST request to save questionnaire answers (legacy): {} (retake={})", answers, retake);

        Optional<String> currentUserLogin = SecurityUtils.getCurrentUserLogin();
        if (currentUserLogin.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "User not authenticated"));
        }
        String userLogin = currentUserLogin.get();

        // Extract profile fields
        ProfileFields fields = extractProfileFields(answers);

        // Get or create person profile for current user
        PersonProfile personProfile;
        try {
            personProfile = getOrCreateProfileForRetake(userLogin, fields, retake);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }

        // If test already completed and not a retake, return a message
        if (Boolean.TRUE.equals(personProfile.getTestCompleted()) && !retake) {
            return ResponseEntity.status(409).body(Map.of("error", "Test already completed. Use retake option to overwrite."));
        }

        // If retake, delete old answers for editable questions only
        if (retake && Boolean.TRUE.equals(personProfile.getTestCompleted())) {
            // Use repository query instead of lazy-loaded collection
            List<UserTestAnswer> allAnswers = userTestAnswerRepository.findByPersonProfile(personProfile);
            List<UserTestAnswer> toDelete = allAnswers.stream()
                .filter(ans -> Boolean.TRUE.equals(ans.getQuestion().getEditable()))
                .toList();
            userTestAnswerRepository.deleteAll(toDelete);
        }

        // Save each answer using the helper
        saveUserTestAnswers(answers, personProfile);

        // Mark test as completed and save updated profile
        personProfile.setTestCompleted(true);
        personProfileRepository.save(personProfile);

        log.info("Successfully saved questionnaire answers (legacy) for user: {} and marked test as completed", userLogin);
        return ResponseEntity.ok(Map.of("message", "Questionnaire answers saved successfully"));
    }

    /**
     * {@code GET  /questionnaire-answers/profile/{profileId}} : Get all questions with options and answers for a specific profile.
     * This endpoint is useful for testing and debugging purposes.
     *
     * @param profileId the profile ID to get answers for
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the questions with answers
     */
    @GetMapping("/questionnaire-answers/profile/{profileId}")
    @Transactional(readOnly = true)
    public ResponseEntity<Map<String, Object>> getQuestionnaireAnswersForProfile(@PathVariable Long profileId) {
        log.debug("REST request to get questionnaire answers for profile: {}", profileId);

        // Check if profile exists
        Optional<PersonProfile> profileOpt = personProfileRepository.findById(profileId);
        if (profileOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        PersonProfile profile = profileOpt.get();
        
        // Get all questions with their options
        List<TestQuestion> allQuestions = testQuestionRepository.findAllWithOptions();
        
        // Get all answers for this profile
        List<UserTestAnswer> userAnswers = userTestAnswerRepository.findByPersonProfile(profile);
        Map<Long, UserTestAnswer> answerMap = userAnswers.stream()
            .collect(java.util.stream.Collectors.toMap(
                answer -> answer.getQuestion().getId(),
                answer -> answer
            ));
        
        // Build the response
        List<Map<String, Object>> questionsWithAnswers = new ArrayList<>();
        
        for (TestQuestion question : allQuestions) {
            Map<String, Object> questionData = new HashMap<>();
            questionData.put("questionId", question.getId());
            questionData.put("questionText", question.getQuestionText());
            questionData.put("questionType", question.getQuestionType());
            questionData.put("category", question.getCategory());
            questionData.put("stepNumber", question.getStepNumber());
            questionData.put("isRequired", question.getIsRequired());
            questionData.put("editable", question.getEditable());
            questionData.put("language", question.getLanguage());
            
            // Add options
            List<Map<String, Object>> options = new ArrayList<>();
            if (question.getOptions() != null) {
                for (TestAnswerOption option : question.getOptions()) {
                    Map<String, Object> optionData = new HashMap<>();
                    optionData.put("id", option.getId());
                    optionData.put("optionText", option.getOptionText());
                    optionData.put("value", option.getValue());
                    options.add(optionData);
                }
            }
            questionData.put("options", options);
            
            // Add answer if exists
            UserTestAnswer userAnswer = answerMap.get(question.getId());
            if (userAnswer != null) {
                Map<String, Object> answerData = new HashMap<>();
                answerData.put("answerId", userAnswer.getId());
                answerData.put("answerValue", userAnswer.getAnswerValue());
                answerData.put("answerText", userAnswer.getAnswerText());
                answerData.put("timestamp", userAnswer.getTimestamp());
                questionData.put("answer", answerData);
            } else {
                questionData.put("answer", null);
            }
            
            questionsWithAnswers.add(questionData);
        }
        
        // Build profile information
        Map<String, Object> profileData = new HashMap<>();
        profileData.put("profileId", profile.getId());
        profileData.put("firstName", profile.getFirstName());
        profileData.put("lastName", profile.getLastName());
        profileData.put("dob", profile.getDob());
        profileData.put("gender", profile.getGender());
        profileData.put("testCompleted", profile.getTestCompleted());
        if (profile.getInternalUser() != null) {
            profileData.put("userLogin", profile.getInternalUser().getLogin());
            profileData.put("userEmail", profile.getInternalUser().getEmail());
        }
        
        // Build final response
        Map<String, Object> response = new HashMap<>();
        response.put("profile", profileData);
        response.put("questions", questionsWithAnswers);
        response.put("totalQuestions", allQuestions.size());
        response.put("answeredQuestions", userAnswers.size());
        response.put("generatedAt", java.time.Instant.now());
        
        log.debug("Generated questionnaire data for profile {}: {} questions, {} answers", 
                 profileId, allQuestions.size(), userAnswers.size());
        
        return ResponseEntity.ok(response);
    }

    /**
     * {@code GET  /questionnaire-answers/profile/user/{userLogin}} : Get all questions with options and answers for a specific user login.
     * This endpoint is useful for testing and debugging purposes.
     *
     * @param userLogin the user login to get answers for
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the questions with answers
     */
    @GetMapping("/questionnaire-answers/profile/user/{userLogin}")
    @Transactional(readOnly = true)
    public ResponseEntity<Map<String, Object>> getQuestionnaireAnswersForUser(@PathVariable String userLogin) {
        log.debug("REST request to get questionnaire answers for user: {}", userLogin);

        // Find profile by user login
        Optional<PersonProfile> profileOpt = personProfileRepository.findByInternalUserLogin(userLogin);
        if (profileOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        // Delegate to the profile ID endpoint
        return getQuestionnaireAnswersForProfile(profileOpt.get().getId());
    }
}
