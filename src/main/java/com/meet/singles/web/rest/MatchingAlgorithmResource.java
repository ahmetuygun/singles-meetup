package com.meet.singles.web.rest;

import com.meet.singles.service.SeatingAssignmentService;
import com.meet.singles.service.SeatingAssignmentService.Table;
import com.meet.singles.service.SampleDataGeneratorService;
import com.meet.singles.domain.PersonProfile;
import com.meet.singles.repository.PersonProfileRepository;
import com.meet.singles.repository.UserTestAnswerRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.ArrayList;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class MatchingAlgorithmResource {

    private static final Logger log = LoggerFactory.getLogger(MatchingAlgorithmResource.class);
    
    private final SeatingAssignmentService seatingAssignmentService;
    private final SampleDataGeneratorService sampleDataGeneratorService;
    private final PersonProfileRepository personProfileRepository;
    private final UserTestAnswerRepository userTestAnswerRepository;
    
    public MatchingAlgorithmResource(SeatingAssignmentService seatingAssignmentService,
                                   SampleDataGeneratorService sampleDataGeneratorService,
                                   PersonProfileRepository personProfileRepository,
                                   UserTestAnswerRepository userTestAnswerRepository) {
        this.seatingAssignmentService = seatingAssignmentService;
        this.sampleDataGeneratorService = sampleDataGeneratorService;
        this.personProfileRepository = personProfileRepository;
        this.userTestAnswerRepository = userTestAnswerRepository;
    }
    
    /**
     * Generate participants and create matching assignments
     * 
     * @param numberOfJoiners total number of participants (must be divisible by 4 for table balance)
     * @param reset optional parameter to clear existing data first (default: false)
     * @return formatted table assignments for all rounds
     */
    @PostMapping("/matching/generate-and-match/{numberOfJoiners}")
    public ResponseEntity<Map<String, Object>> generateAndMatch(
            @PathVariable int numberOfJoiners,
            @RequestParam(defaultValue = "false") boolean reset) {
        log.debug("REST request to generate {} joiners and create matching (reset={})", numberOfJoiners, reset);
        
        try {
            // Validate number of joiners
            if (numberOfJoiners <= 0) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Number of joiners must be positive"
                ));
            }
            
            if (numberOfJoiners % 4 != 0) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Number of joiners must be divisible by 4 for proper table balance",
                    "suggestion", "Try " + (numberOfJoiners + (4 - numberOfJoiners % 4)) + " joiners instead"
                ));
            }
            
            if (numberOfJoiners > 100) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Maximum 100 joiners allowed"
                ));
            }
            
            // Clear existing test users if reset is not requested (to ensure clean matching)
            if (!reset) {
                log.info("Clearing existing test users to ensure only new participants are matched");
                clearExistingData();
            } else {
                log.info("Resetting database before generating new participants");
                clearAllData();
            }
            
            // Calculate gender split (equal males and females)
            int maleCount = numberOfJoiners / 2;
            int femaleCount = numberOfJoiners / 2;
            
            log.info("Generating {} males and {} females for matching", maleCount, femaleCount);
            
            // Generate sample data
            Map<String, Object> generationResult = sampleDataGeneratorService.generateSampleData(maleCount, femaleCount);
            
            // Check if generation was successful
            if ((Integer) generationResult.get("createdUsers") != numberOfJoiners) {
                return ResponseEntity.internalServerError().body(Map.of(
                    "error", "Failed to generate all requested users",
                    "requested", numberOfJoiners,
                    "created", generationResult.get("createdUsers")
                ));
            }
            
            // Get ONLY the newly created profiles for matching (should be exactly numberOfJoiners)
            List<PersonProfile> completedProfiles = personProfileRepository.findByTestCompletedTrue();
            
            // Verify we have exactly the number we requested
            if (completedProfiles.size() != numberOfJoiners) {
                log.warn("Expected {} profiles but found {}. Using all available profiles.", 
                        numberOfJoiners, completedProfiles.size());
            }
            
            log.info("Using {} profiles for matching (requested: {})", completedProfiles.size(), numberOfJoiners);
            
            // Generate seating assignments
            List<List<Table>> assignments = seatingAssignmentService.generateSeatingAssignments(completedProfiles);
            
            if (assignments == null || assignments.isEmpty()) {
                return ResponseEntity.internalServerError().body(Map.of(
                    "error", "Failed to generate seating assignments",
                    "possibleCause", "Not enough participants or gender imbalance",
                    "generatedUsers", generationResult,
                    "completedProfiles", completedProfiles.size()
                ));
            }
            
            // Format the response
            Map<String, Object> result = formatMatchingResult(assignments, generationResult, numberOfJoiners);
            result.put("resetPerformed", reset);
            
            return ResponseEntity.ok(result);
            
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Error in generate and match", e);
            return ResponseEntity.internalServerError().body(Map.of(
                "error", "Failed to generate and match: " + e.getMessage()
            ));
        }
    }
    
    /**
     * Clear existing data from the database
     */
    private void clearExistingData() {
        try {
            // Note: This is a simplified approach. In production, you'd want more sophisticated cleanup
            log.info("Clearing existing test user data...");
            
            // Get all test users
            List<PersonProfile> testUsers = personProfileRepository.findByTestTrue();
            
            // Delete user test answers for test users
            log.info("Clearing user test answers for {} test users...", testUsers.size());
            for (PersonProfile testUser : testUsers) {
                userTestAnswerRepository.findByPersonProfile(testUser).forEach(userTestAnswerRepository::delete);
            }
            
            // Delete test user profiles
            log.info("Clearing test user profiles...");
            personProfileRepository.deleteAll(testUsers);
            
            log.info("Test user data cleared successfully. {} test users removed", testUsers.size());
        } catch (Exception e) {
            log.error("Error clearing existing test data", e);
            throw new RuntimeException("Failed to clear existing test data: " + e.getMessage());
        }
    }
    
    /**
     * Clear ALL data from the database (test and real users)
     */
    private void clearAllData() {
        try {
            log.info("Clearing ALL user data...");
            
            // Delete in correct order to handle foreign key constraints
            // First delete all user_test_answer records
            log.info("Clearing all user test answers...");
            userTestAnswerRepository.deleteAll();
            
            // Then delete all person profiles
            log.info("Clearing all person profiles...");
            personProfileRepository.deleteAll();
            
            log.info("All data cleared successfully");
        } catch (Exception e) {
            log.error("Error clearing all data", e);
            throw new RuntimeException("Failed to clear all data: " + e.getMessage());
        }
    }
    
    /**
     * Generate matching assignments for existing participants
     * 
     * @return formatted table assignments for all rounds
     */
    @PostMapping("/matching/generate")
    public ResponseEntity<Map<String, Object>> generateMatching() {
        log.debug("REST request to generate matching assignments");
        
        try {
            List<PersonProfile> completedProfiles = personProfileRepository.findByTestCompletedTrue();
            
            if (completedProfiles.size() < 4) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Not enough participants (minimum 4 required)",
                    "currentCount", completedProfiles.size()
                ));
            }
            
            List<List<Table>> assignments = seatingAssignmentService.generateSeatingAssignments(completedProfiles);
            
            if (assignments == null || assignments.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "No seating assignments could be generated",
                    "possibleCauses", List.of(
                        "Not enough participants (minimum 4 required)",
                        "Gender imbalance (need equal males and females)",
                        "Participants haven't completed questionnaires"
                    )
                ));
            }
            
            Map<String, Object> result = formatMatchingResult(assignments, null, 0);
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            log.error("Error generating matching assignments", e);
            return ResponseEntity.internalServerError().body(Map.of(
                "error", "Failed to generate matching: " + e.getMessage()
            ));
        }
    }
    
    /**
     * Get information about the matching algorithm
     */
    @GetMapping("/matching/info")
    public ResponseEntity<Map<String, Object>> getMatchingInfo() {
        Map<String, Object> info = Map.of(
            "description", "Generate compatibility-based seating assignments for speed dating events",
            "endpoints", Map.of(
                "POST /api/matching/generate-and-match/{numberOfJoiners}", "Generate participants and create matching (must be divisible by 4)",
                "POST /api/matching/generate-and-match/{numberOfJoiners}?reset=true", "Generate participants with database reset first",
                "POST /api/matching/generate", "Generate matching for existing participants",
                "POST /api/matching/clear-test-users", "Clear only test users (preserve real users)",
                "GET /api/matching/info", "Get this information",
                "GET /api/matching/stats", "Get current statistics"
            ),
            "algorithm", Map.of(
                "rounds", 4,
                "sessionDuration", "30 minutes each",
                "tableSize", 4,
                "genderBalance", "2 males + 2 females per table",
                "noRepeats", "Participants never meet the same person twice"
            ),
            "compatibility", Map.of(
                "personalityTraits", "40% weight",
                "lifestylePreferences", "30% weight",
                "valuesAndGoals", "30% weight",
                "questionsUsed", List.of(6001, 6004, 6010, 6013, 6022, 6019, 6028, 6037, 6061, 6079)
            ),
            "requirements", Map.of(
                "minimumParticipants", 4,
                "maximumParticipants", 100,
                "genderBalance", "Must have equal number of males and females",
                "questionnaires", "All participants must complete questionnaires"
            ),
            "examples", Map.of(
                "small", "POST /api/matching/generate-and-match/8 - generates 4M+4F and matches",
                "medium", "POST /api/matching/generate-and-match/16 - generates 8M+8F and matches",
                "large", "POST /api/matching/generate-and-match/36 - generates 18M+18F and matches"
            )
        );
        
        return ResponseEntity.ok(info);
    }
    
    /**
     * Get current matching statistics
     */
    @GetMapping("/matching/stats")
    public ResponseEntity<Map<String, Object>> getMatchingStats() {
        try {
            List<PersonProfile> allProfiles = personProfileRepository.findAll();
            List<PersonProfile> completedProfiles = personProfileRepository.findByTestCompletedTrue();
            List<PersonProfile> testUsers = personProfileRepository.findByTestTrue();
            List<PersonProfile> realUsers = personProfileRepository.findByTestFalse();
            List<PersonProfile> completedTestUsers = personProfileRepository.findByTestCompletedTrueAndTestTrue();
            List<PersonProfile> completedRealUsers = personProfileRepository.findByTestCompletedTrueAndTestFalse();
            
            Map<String, List<PersonProfile>> allByGender = allProfiles.stream()
                .collect(Collectors.groupingBy(p -> p.getGender() != null ? p.getGender() : "Unknown"));
            
            Map<String, List<PersonProfile>> completedByGender = completedProfiles.stream()
                .collect(Collectors.groupingBy(p -> p.getGender() != null ? p.getGender() : "Unknown"));
            
            Map<String, List<PersonProfile>> testUsersByGender = testUsers.stream()
                .collect(Collectors.groupingBy(p -> p.getGender() != null ? p.getGender() : "Unknown"));
            
            Map<String, List<PersonProfile>> realUsersByGender = realUsers.stream()
                .collect(Collectors.groupingBy(p -> p.getGender() != null ? p.getGender() : "Unknown"));
            
            Map<String, Object> stats = new HashMap<>();
            stats.put("totalProfiles", allProfiles.size());
            stats.put("completedProfiles", completedProfiles.size());
            stats.put("testUsers", testUsers.size());
            stats.put("realUsers", realUsers.size());
            stats.put("completedTestUsers", completedTestUsers.size());
            stats.put("completedRealUsers", completedRealUsers.size());
            
            stats.put("allProfilesByGender", allByGender.entrySet().stream()
                .collect(Collectors.toMap(
                    Map.Entry::getKey,
                    entry -> entry.getValue().size()
                )));
            stats.put("completedProfilesByGender", completedByGender.entrySet().stream()
                .collect(Collectors.toMap(
                    Map.Entry::getKey,
                    entry -> entry.getValue().size()
                )));
            stats.put("testUsersByGender", testUsersByGender.entrySet().stream()
                .collect(Collectors.toMap(
                    Map.Entry::getKey,
                    entry -> entry.getValue().size()
                )));
            stats.put("realUsersByGender", realUsersByGender.entrySet().stream()
                .collect(Collectors.toMap(
                    Map.Entry::getKey,
                    entry -> entry.getValue().size()
                )));
            
            int completedMales = completedByGender.getOrDefault("Male", List.of()).size();
            int completedFemales = completedByGender.getOrDefault("Female", List.of()).size();
            
            boolean canGenerateMatching = completedMales >= 2 && completedFemales >= 2 && 
                                        completedMales == completedFemales && 
                                        completedMales % 2 == 0;
            
            stats.put("canGenerateMatching", canGenerateMatching);
            stats.put("maxPossibleTables", Math.min(completedMales, completedFemales) / 2);
            stats.put("estimatedRounds", 4);
            
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            log.error("Error getting matching statistics", e);
            return ResponseEntity.internalServerError().body(Map.of(
                "error", "Failed to get statistics: " + e.getMessage()
            ));
        }
    }
    
    /**
     * Format the matching result into a readable format
     */
    private Map<String, Object> formatMatchingResult(List<List<Table>> assignments, 
                                                   Map<String, Object> generationResult, 
                                                   int numberOfJoiners) {
        Map<String, Object> result = new HashMap<>();
        
        // Add generation info if provided
        if (generationResult != null) {
            result.put("participantGeneration", Map.of(
                "requested", numberOfJoiners,
                "generated", generationResult.get("createdUsers"),
                "males", generationResult.get("maleUsers"),
                "females", generationResult.get("femaleUsers")
            ));
        }
        
        // Format assignments by round
        Map<String, Object> rounds = new HashMap<>();
        Map<String, String> formattedAssignments = new HashMap<>();
        
        for (int roundIndex = 0; roundIndex < assignments.size(); roundIndex++) {
            List<Table> round = assignments.get(roundIndex);
            String roundKey = "Round" + (roundIndex + 1);
            Map<String, String> roundTables = new HashMap<>();
            
            for (int tableIndex = 0; tableIndex < round.size(); tableIndex++) {
                Table table = round.get(tableIndex);
                int tableNumber = tableIndex + 1;
                String tableKey = "Table" + tableNumber;
                
                // Get participant names
                List<String> participants = new ArrayList<>();
                for (PersonProfile participant : table.getParticipants()) {
                    participants.add(participant.getFirstName() + " " + participant.getLastName());
                }
                
                String participantList = String.join(", ", participants);
                roundTables.put(tableKey, participantList);
                
                // Also add to formatted assignments
                String assignmentKey = "Table" + tableNumber + "/Round" + (roundIndex + 1);
                formattedAssignments.put(assignmentKey, participantList);
            }
            
            rounds.put(roundKey, roundTables);
        }
        
        // Calculate summary statistics
        long totalRounds = assignments.size();
        long tablesPerRound = assignments.isEmpty() ? 0 : assignments.get(0).size();
        long totalParticipants = assignments.stream()
            .flatMap(round -> round.stream())
            .flatMap(table -> table.getParticipants().stream())
            .map(p -> p.getFirstName() + " " + p.getLastName())
            .distinct()
            .count();
        
        Map<String, Object> summary = new HashMap<>();
        summary.put("totalParticipants", totalParticipants);
        summary.put("totalRounds", totalRounds);
        summary.put("tablesPerRound", tablesPerRound);
        summary.put("totalAssignments", assignments.stream().mapToInt(List::size).sum());
        
        result.put("formattedAssignments", formattedAssignments);
        result.put("roundBreakdown", rounds);
        result.put("summary", summary);
        result.put("generatedAt", java.time.Instant.now());
        
        return result;
    }
    
    /**
     * Clear only test users from the database
     * 
     * @return confirmation of test user deletion
     */
    @PostMapping("/matching/clear-test-users")
    public ResponseEntity<Map<String, Object>> clearTestUsers() {
        log.debug("REST request to clear test users only");
        
        try {
            // Get count before clearing
            List<PersonProfile> testUsersBefore = personProfileRepository.findByTestTrue();
            List<PersonProfile> realUsersBefore = personProfileRepository.findByTestFalse();
            
            // Clear test users
            clearExistingData();
            
            // Get count after clearing
            List<PersonProfile> allUsersAfter = personProfileRepository.findAll();
            List<PersonProfile> realUsersAfter = personProfileRepository.findByTestFalse();
            
            Map<String, Object> result = new HashMap<>();
            result.put("testUsersRemoved", testUsersBefore.size());
            result.put("realUsersPreserved", realUsersBefore.size());
            result.put("totalUsersAfter", allUsersAfter.size());
            result.put("realUsersAfter", realUsersAfter.size());
            result.put("clearedAt", java.time.Instant.now());
            
            log.info("Cleared {} test users, preserved {} real users", 
                    testUsersBefore.size(), realUsersBefore.size());
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            log.error("Error clearing test users", e);
            return ResponseEntity.internalServerError().body(Map.of(
                "error", "Failed to clear test users: " + e.getMessage()
            ));
        }
    }
} 