package com.meet.singles.service;

import com.meet.singles.domain.TestQuestion;
import com.meet.singles.domain.TestAnswerOption;
import com.meet.singles.domain.User;
import com.meet.singles.domain.PersonProfile;
import com.meet.singles.domain.enumeration.CategoryType;
import com.meet.singles.domain.enumeration.QuestionType;
import com.meet.singles.repository.TestQuestionRepository;
import com.meet.singles.repository.UserRepository;
import com.meet.singles.repository.PersonProfileRepository;
import com.meet.singles.web.rest.QuestionnaireAnswersResource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class SampleDataGeneratorService {

    private static final Logger log = LoggerFactory.getLogger(SampleDataGeneratorService.class);
    
    private final TestQuestionRepository testQuestionRepository;
    private final UserRepository userRepository;
    private final PersonProfileRepository personProfileRepository;
    private final QuestionnaireAnswersResource questionnaireAnswersResource;
    
    private final Random random = new Random();
    
    // Sample names for generating users
    private final String[] MALE_FIRST_NAMES = {
        "James", "John", "Robert", "Michael", "William", "David", "Richard", "Joseph", 
        "Thomas", "Christopher", "Charles", "Daniel", "Matthew", "Anthony", "Mark", 
        "Donald", "Steven", "Paul", "Andrew", "Joshua", "Kenneth", "Kevin", "Brian",
        "George", "Timothy", "Ronald", "Jason", "Edward", "Jeffrey", "Ryan"
    };
    
    private final String[] FEMALE_FIRST_NAMES = {
        "Mary", "Patricia", "Jennifer", "Linda", "Elizabeth", "Barbara", "Susan", 
        "Jessica", "Sarah", "Karen", "Lisa", "Nancy", "Betty", "Helen", "Sandra",
        "Donna", "Carol", "Ruth", "Sharon", "Michelle", "Laura", "Sarah", "Kimberly",
        "Deborah", "Dorothy", "Lisa", "Nancy", "Karen", "Betty", "Helen"
    };
    
    private final String[] LAST_NAMES = {
        "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
        "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson",
        "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson",
        "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson"
    };
    
    public SampleDataGeneratorService(TestQuestionRepository testQuestionRepository,
                                    UserRepository userRepository,
                                    PersonProfileRepository personProfileRepository,
                                    QuestionnaireAnswersResource questionnaireAnswersResource) {
        this.testQuestionRepository = testQuestionRepository;
        this.userRepository = userRepository;
        this.personProfileRepository = personProfileRepository;
        this.questionnaireAnswersResource = questionnaireAnswersResource;
    }
    
    /**
     * Generate sample users with random questionnaire answers
     */
    public Map<String, Object> generateSampleData(int numberOfUsers) {
        log.info("Starting generation of {} sample users", numberOfUsers);
        
        if (numberOfUsers <= 0 || numberOfUsers > 100) {
            throw new IllegalArgumentException("Number of users must be between 1 and 100");
        }
        
        // Ensure even number for gender balance
        if (numberOfUsers % 2 != 0) {
            numberOfUsers++; // Add one to make it even
        }
        
        List<TestQuestion> allQuestions = testQuestionRepository.findAllWithOptions();
        if (allQuestions.isEmpty()) {
            throw new IllegalStateException("No questions found in database");
        }
        
        List<String> createdUsers = new ArrayList<>();
        List<String> errors = new ArrayList<>();
        
        int maleCount = numberOfUsers / 2;
        int femaleCount = numberOfUsers / 2;
        
        return generateUsersWithCounts(maleCount, femaleCount, allQuestions);
    }
    
    /**
     * Generate sample users with specific male and female counts
     */
    public Map<String, Object> generateSampleData(int maleCount, int femaleCount) {
        log.info("Starting generation of {} male and {} female users", maleCount, femaleCount);
        
        if (maleCount < 0 || femaleCount < 0) {
            throw new IllegalArgumentException("Male and female counts must be non-negative");
        }
        
        if (maleCount + femaleCount == 0) {
            throw new IllegalArgumentException("Must generate at least one user");
        }
        
        if (maleCount + femaleCount > 100) {
            throw new IllegalArgumentException("Total users must not exceed 100");
        }
        
        List<TestQuestion> allQuestions = testQuestionRepository.findAllWithOptions();
        if (allQuestions.isEmpty()) {
            throw new IllegalStateException("No questions found in database");
        }
        
        return generateUsersWithCounts(maleCount, femaleCount, allQuestions);
    }
    
    /**
     * Helper method to generate users with specific counts
     */
    private Map<String, Object> generateUsersWithCounts(int maleCount, int femaleCount, List<TestQuestion> allQuestions) {
        List<String> createdUsers = new ArrayList<>();
        List<String> errors = new ArrayList<>();
        
        // Generate male users
        for (int i = 0; i < maleCount; i++) {
            try {
                String userLogin = generateUser("Male", i);
                generateAnswersForUser(userLogin, allQuestions);
                createdUsers.add(userLogin);
                log.debug("Created male user: {}", userLogin);
            } catch (Exception e) {
                log.error("Failed to create male user {}: {}", i, e.getMessage());
                errors.add("Failed to create male user " + i + ": " + e.getMessage());
            }
        }
        
        // Generate female users
        for (int i = 0; i < femaleCount; i++) {
            try {
                String userLogin = generateUser("Female", i);
                generateAnswersForUser(userLogin, allQuestions);
                createdUsers.add(userLogin);
                log.debug("Created female user: {}", userLogin);
            } catch (Exception e) {
                log.error("Failed to create female user {}: {}", i, e.getMessage());
                errors.add("Failed to create female user " + i + ": " + e.getMessage());
            }
        }
        
        Map<String, Object> result = new HashMap<>();
        result.put("requestedUsers", maleCount + femaleCount);
        result.put("createdUsers", createdUsers.size());
        result.put("maleUsers", maleCount);
        result.put("femaleUsers", femaleCount);
        result.put("userLogins", createdUsers);
        result.put("errors", errors);
        result.put("generatedAt", java.time.Instant.now());
        
        log.info("Sample data generation completed. Created {} users with {} errors", 
                createdUsers.size(), errors.size());
        
        return result;
    }
    
    /**
     * Generate a single user with profile
     */
    private String generateUser(String gender, int index) {
        String firstName = getRandomFirstName(gender);
        String lastName = getRandomLastName();
        String userLogin = generateUniqueLogin(firstName, lastName, index);
        String email = userLogin + "@sample.com";
        
        // Create user
        User user = new User();
        user.setId(UUID.randomUUID().toString());
        user.setLogin(userLogin);
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setEmail(email);
        user.setActivated(true);
        user.setLangKey("en");
        user.setCreatedBy("system");
        user.setCreatedDate(java.time.Instant.now());
        
        user = userRepository.save(user);
        
        // Create person profile
        PersonProfile profile = new PersonProfile();
        profile.setFirstName(firstName);
        profile.setLastName(lastName);
        profile.setDob(generateRandomDob());
        profile.setGender(gender);
        profile.setTestCompleted(false); // Will be set to true after answers are submitted
        profile.setTest(true); // Mark as test user
        profile.setInternalUser(user);
        
        personProfileRepository.save(profile);
        
        return userLogin;
    }
    
    /**
     * Generate random answers for a user and submit them
     */
    private void generateAnswersForUser(String userLogin, List<TestQuestion> questions) {
        // Set security context for the user
        setSecurityContext(userLogin);
        
        try {
            // Get the user's profile to use real names
            PersonProfile profile = personProfileRepository.findByInternalUserLogin(userLogin).orElse(null);
            
            // Prepare submission data
            QuestionnaireAnswersResource.QuestionnaireSubmissionDTO submission = 
                new QuestionnaireAnswersResource.QuestionnaireSubmissionDTO();
            
            List<QuestionnaireAnswersResource.QuestionAnswerDTO> questionAnswers = new ArrayList<>();
            
            int totalQuestions = 0;
            int answeredQuestions = 0;
            int skippedInfoQuestions = 0;
            
            for (TestQuestion question : questions) {
                totalQuestions++;
                
                // Skip INFO questions entirely - they don't need answers
                if (question.getQuestionType() == QuestionType.INFO) {
                    skippedInfoQuestions++;
                    log.debug("Skipping INFO question: {}", question.getQuestionText());
                    continue;
                }
                
                QuestionnaireAnswersResource.QuestionAnswerDTO questionAnswer = 
                    new QuestionnaireAnswersResource.QuestionAnswerDTO();
                
                questionAnswer.setQuestionId(question.getId());
                questionAnswer.setQuestionText(question.getQuestionText());
                questionAnswer.setQuestionType(question.getQuestionType());
                questionAnswer.setCategory(question.getCategory());
                questionAnswer.setEditable(question.getEditable());
                
                // Generate random answer based on question type and category
                Object answerValue = generateRandomAnswer(question, profile);
                
                // Ensure we have a valid answer (not null)
                if (answerValue == null) {
                    // Provide a default answer based on question type
                    answerValue = getDefaultAnswer(question);
                    log.debug("Using default answer for question {}: {}", question.getId(), answerValue);
                }
                
                questionAnswer.setAnswerValue(answerValue);
                
                // Set options if available
                if (question.getOptions() != null && !question.getOptions().isEmpty()) {
                    List<QuestionnaireAnswersResource.OptionDTO> options = question.getOptions().stream()
                        .map(opt -> new QuestionnaireAnswersResource.OptionDTO(
                            opt.getId(), opt.getOptionText(), opt.getValue()))
                        .collect(Collectors.toList());
                    questionAnswer.setOptions(options);
                }
                
                questionAnswers.add(questionAnswer);
                answeredQuestions++;
            }
            
            submission.setQuestions(questionAnswers);
            
            // Submit answers through the existing service
            var response = questionnaireAnswersResource.saveQuestionnaireAnswersV2(false, submission);
            
            if (!response.getStatusCode().is2xxSuccessful()) {
                throw new RuntimeException("Failed to submit answers: " + response.getBody());
            }
            
            log.info("Successfully submitted answers for user {}: {} total questions, {} answered, {} INFO questions skipped", 
                    userLogin, totalQuestions, answeredQuestions, skippedInfoQuestions);
            
        } finally {
            // Clear security context
            SecurityContextHolder.clearContext();
        }
    }
    
    /**
     * Get default answer for a question when generateRandomAnswer returns null
     */
    private Object getDefaultAnswer(TestQuestion question) {
        QuestionType questionType = question.getQuestionType();
        
        switch (questionType) {
            case SINGLE_CHOICE:
            case MULTIPLE_CHOICE:
                if (question.getOptions() != null && !question.getOptions().isEmpty()) {
                    // Return the first option's value as default
                    return question.getOptions().iterator().next().getValue();
                }
                return 1; // Default numeric value
                
            case TEXT_INPUT:
                return "Default text response";
                
            case DATE_INPUT:
                return generateRandomDob().toString();
                
            case ONE_TO_FIVE:
                return 3; // Middle value for scale questions
                
            default:
                return 1; // Safe default
        }
    }
    
    /**
     * Generate random answer based on question type and category
     */
    private Object generateRandomAnswer(TestQuestion question, PersonProfile profile) {
        CategoryType category = question.getCategory();
        QuestionType questionType = question.getQuestionType();
        
        // Skip INFO questions - they should not be processed here
        if (questionType == QuestionType.INFO) {
            return null; // This will be handled by the caller
        }
        
        // Handle special categories first
        if (category == CategoryType.USERNAME) {
            // Use the real names from the profile
            if (profile != null && profile.getFirstName() != null && profile.getLastName() != null) {
                return profile.getFirstName() + " " + profile.getLastName();
            }
            return "Sample User"; // Fallback
        } else if (category == CategoryType.DOB) {
            if (profile != null && profile.getDob() != null) {
                return profile.getDob().toString();
            }
            return generateRandomDob().toString();
        } else if (category == CategoryType.GENDER) {
            // Use the profile gender if available, otherwise random
            if (profile != null && profile.getGender() != null) {
                // Map gender to option value (assuming 1=Male, 2=Female based on common patterns)
                return "Male".equalsIgnoreCase(profile.getGender()) ? 1 : 2;
            }
            return random.nextBoolean() ? 1 : 2;
        }
        
        // Handle by question type
        switch (questionType) {
            case SINGLE_CHOICE:
            case MULTIPLE_CHOICE:
                if (question.getOptions() != null && !question.getOptions().isEmpty()) {
                    List<TestAnswerOption> optionsList = new ArrayList<>(question.getOptions());
                    TestAnswerOption randomOption = optionsList.get(
                        random.nextInt(optionsList.size()));
                    return randomOption.getValue();
                }
                return 1; // Default fallback
                
            case TEXT_INPUT:
                return generateRandomText(category);
                
            case DATE_INPUT:
                return generateRandomDob().toString();
                
            case ONE_TO_FIVE:
                return random.nextInt(5) + 1; // 1-5 scale
                
            case COUNTRY_SELECTION:
                String[] countries = {"United States", "Canada", "United Kingdom", "Germany", "France", "Australia"};
                return countries[random.nextInt(countries.length)];
                
            case JOB_SELECTION:
                String[] jobs = {"Software Engineer", "Teacher", "Doctor", "Designer", "Manager", "Consultant", "Artist"};
                return jobs[random.nextInt(jobs.length)];
                
            default:
                // For any unknown question types, provide a safe default
                log.warn("Unknown question type: {} for question ID: {}, using default answer", questionType, question.getId());
                return random.nextInt(5) + 1; // Default to scale
        }
    }
    
    /**
     * Generate random text based on category
     */
    private String generateRandomText(CategoryType category) {
        switch (category) {
            case LIFESTYLE_HABITS:
                String[] interests = {"Reading", "Traveling", "Cooking", "Sports", "Music", "Art", "Technology"};
                return interests[random.nextInt(interests.length)];
            case PERSONALITY_COMMUNICATION:
                String[] hobbies = {"Photography", "Hiking", "Gaming", "Dancing", "Painting", "Writing"};
                return hobbies[random.nextInt(hobbies.length)];
            default:
                return "Sample text response";
        }
    }
    
    /**
     * Generate random date of birth (age 22-45)
     */
    private LocalDate generateRandomDob() {
        int age = 22 + random.nextInt(24); // Age between 22-45
        return LocalDate.now().minusYears(age).minusDays(random.nextInt(365));
    }
    
    /**
     * Get random first name based on gender
     */
    private String getRandomFirstName(String gender) {
        if ("Male".equalsIgnoreCase(gender)) {
            return MALE_FIRST_NAMES[random.nextInt(MALE_FIRST_NAMES.length)];
        } else {
            return FEMALE_FIRST_NAMES[random.nextInt(FEMALE_FIRST_NAMES.length)];
        }
    }
    
    /**
     * Get random last name
     */
    private String getRandomLastName() {
        return LAST_NAMES[random.nextInt(LAST_NAMES.length)];
    }
    
    /**
     * Generate unique login
     */
    private String generateUniqueLogin(String firstName, String lastName, int index) {
        String baseLogin = (firstName + lastName).toLowerCase().replaceAll("[^a-z]", "");
        String login = baseLogin + index;
        
        // Ensure uniqueness
        int counter = 1;
        while (userRepository.findOneByLogin(login).isPresent()) {
            login = baseLogin + index + "_" + counter;
            counter++;
        }
        
        return login;
    }
    
    /**
     * Set security context for a user
     */
    private void setSecurityContext(String userLogin) {
        List<SimpleGrantedAuthority> authorities = List.of(new SimpleGrantedAuthority("ROLE_USER"));
        UsernamePasswordAuthenticationToken authentication = 
            new UsernamePasswordAuthenticationToken(userLogin, null, authorities);
        SecurityContextHolder.getContext().setAuthentication(authentication);
    }
} 