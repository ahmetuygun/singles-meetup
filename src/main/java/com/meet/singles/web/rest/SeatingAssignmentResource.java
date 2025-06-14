package com.meet.singles.web.rest;

import com.meet.singles.domain.PersonProfile;
import com.meet.singles.repository.PersonProfileRepository;
import com.meet.singles.service.SeatingAssignmentService;
import com.meet.singles.service.SeatingAssignmentService.Table;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class SeatingAssignmentResource {

    private static final Logger log = LoggerFactory.getLogger(SeatingAssignmentResource.class);
    
    private final SeatingAssignmentService seatingAssignmentService;
    private final PersonProfileRepository personProfileRepository;
    
    public SeatingAssignmentResource(SeatingAssignmentService seatingAssignmentService,
                                   PersonProfileRepository personProfileRepository) {
        this.seatingAssignmentService = seatingAssignmentService;
        this.personProfileRepository = personProfileRepository;
    }
    
    /**
     * Generate seating assignments for all completed profiles
     */
    @GetMapping("/seating-assignments/generate")
    @Transactional(readOnly = true)
    public ResponseEntity<Map<String, Object>> generateSeatingAssignments() {
        log.debug("REST request to generate seating assignments");
        
        try {
            // Get all completed profiles
            List<PersonProfile> completedProfiles = personProfileRepository.findByTestCompletedTrue();
            
            if (completedProfiles.size() < 4) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Need at least 4 completed profiles to generate seating assignments",
                    "currentCount", completedProfiles.size()
                ));
            }
            
            // Separate by gender for validation
            Map<String, List<PersonProfile>> byGender = completedProfiles.stream()
                .collect(Collectors.groupingBy(PersonProfile::getGender));
            
            int maleCount = byGender.getOrDefault("Male", Collections.emptyList()).size();
            int femaleCount = byGender.getOrDefault("Female", Collections.emptyList()).size();
            
            if (maleCount != femaleCount) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Must have equal number of males and females",
                    "maleCount", maleCount,
                    "femaleCount", femaleCount
                ));
            }
            
            if (maleCount % 2 != 0) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Must have even number of participants of each gender",
                    "maleCount", maleCount,
                    "femaleCount", femaleCount
                ));
            }
            
            // Generate assignments
            List<List<Table>> assignments = seatingAssignmentService.generateSeatingAssignments(completedProfiles);
            
            // Convert to response format
            Map<String, Object> response = new HashMap<>();
            response.put("totalParticipants", completedProfiles.size());
            response.put("maleCount", maleCount);
            response.put("femaleCount", femaleCount);
            response.put("totalRounds", assignments.size());
            response.put("tablesPerRound", assignments.isEmpty() ? 0 : assignments.get(0).size());
            
            List<Map<String, Object>> roundsData = new ArrayList<>();
            for (int roundNum = 0; roundNum < assignments.size(); roundNum++) {
                List<Table> round = assignments.get(roundNum);
                
                Map<String, Object> roundData = new HashMap<>();
                roundData.put("roundNumber", roundNum + 1);
                roundData.put("tables", convertTablesToResponse(round));
                
                roundsData.add(roundData);
            }
            
            response.put("rounds", roundsData);
            response.put("generatedAt", java.time.Instant.now());
            
            log.info("Generated seating assignments for {} participants across {} rounds", 
                    completedProfiles.size(), assignments.size());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error generating seating assignments", e);
            return ResponseEntity.internalServerError().body(Map.of(
                "error", "Failed to generate seating assignments: " + e.getMessage()
            ));
        }
    }
    
    /**
     * Generate seating assignments for specific profile IDs
     */
    @PostMapping("/seating-assignments/generate")
    @Transactional(readOnly = true)
    public ResponseEntity<Map<String, Object>> generateSeatingAssignmentsForProfiles(
            @RequestBody Map<String, Object> request) {
        
        log.debug("REST request to generate seating assignments for specific profiles");
        
        try {
            @SuppressWarnings("unchecked")
            List<Long> profileIds = (List<Long>) request.get("profileIds");
            
            if (profileIds == null || profileIds.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Profile IDs are required"
                ));
            }
            
            // Get specified profiles
            List<PersonProfile> profiles = personProfileRepository.findAllById(profileIds);
            
            if (profiles.size() != profileIds.size()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Some profile IDs not found",
                    "requested", profileIds.size(),
                    "found", profiles.size()
                ));
            }
            
            // Validate all profiles have completed tests
            List<PersonProfile> incompleteProfiles = profiles.stream()
                .filter(p -> !Boolean.TRUE.equals(p.getTestCompleted()))
                .collect(Collectors.toList());
            
            if (!incompleteProfiles.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "All profiles must have completed tests",
                    "incompleteProfiles", incompleteProfiles.stream()
                        .map(p -> Map.of("id", p.getId(), "name", p.getFirstName() + " " + p.getLastName()))
                        .collect(Collectors.toList())
                ));
            }
            
            // Generate assignments
            List<List<Table>> assignments = seatingAssignmentService.generateSeatingAssignments(profiles);
            
            // Convert to response format (same as above)
            Map<String, Object> response = buildAssignmentResponse(profiles, assignments);
            
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Error generating seating assignments for specific profiles", e);
            return ResponseEntity.internalServerError().body(Map.of(
                "error", "Failed to generate seating assignments: " + e.getMessage()
            ));
        }
    }
    
    /**
     * Get statistics about current profiles
     */
    @GetMapping("/seating-assignments/stats")
    @Transactional(readOnly = true)
    public ResponseEntity<Map<String, Object>> getSeatingStats() {
        log.debug("REST request to get seating assignment statistics");
        
        List<PersonProfile> allProfiles = personProfileRepository.findAll();
        List<PersonProfile> completedProfiles = personProfileRepository.findByTestCompletedTrue();
        
        Map<String, List<PersonProfile>> allByGender = allProfiles.stream()
            .collect(Collectors.groupingBy(p -> p.getGender() != null ? p.getGender() : "Unknown"));
        
        Map<String, List<PersonProfile>> completedByGender = completedProfiles.stream()
            .collect(Collectors.groupingBy(p -> p.getGender() != null ? p.getGender() : "Unknown"));
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalProfiles", allProfiles.size());
        stats.put("completedProfiles", completedProfiles.size());
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
        
        int completedMales = completedByGender.getOrDefault("Male", Collections.emptyList()).size();
        int completedFemales = completedByGender.getOrDefault("Female", Collections.emptyList()).size();
        
        boolean canGenerateAssignments = completedMales >= 2 && completedFemales >= 2 && 
                                       completedMales == completedFemales && 
                                       completedMales % 2 == 0;
        
        stats.put("canGenerateAssignments", canGenerateAssignments);
        stats.put("maxPossibleTables", Math.min(completedMales, completedFemales) / 2);
        
        return ResponseEntity.ok(stats);
    }
    
    /**
     * Helper method to build assignment response
     */
    private Map<String, Object> buildAssignmentResponse(List<PersonProfile> profiles, List<List<Table>> assignments) {
        Map<String, List<PersonProfile>> byGender = profiles.stream()
            .collect(Collectors.groupingBy(PersonProfile::getGender));
        
        int maleCount = byGender.getOrDefault("Male", Collections.emptyList()).size();
        int femaleCount = byGender.getOrDefault("Female", Collections.emptyList()).size();
        
        Map<String, Object> response = new HashMap<>();
        response.put("totalParticipants", profiles.size());
        response.put("maleCount", maleCount);
        response.put("femaleCount", femaleCount);
        response.put("totalRounds", assignments.size());
        response.put("tablesPerRound", assignments.isEmpty() ? 0 : assignments.get(0).size());
        
        List<Map<String, Object>> roundsData = new ArrayList<>();
        for (int roundNum = 0; roundNum < assignments.size(); roundNum++) {
            List<Table> round = assignments.get(roundNum);
            
            Map<String, Object> roundData = new HashMap<>();
            roundData.put("roundNumber", roundNum + 1);
            roundData.put("tables", convertTablesToResponse(round));
            
            roundsData.add(roundData);
        }
        
        response.put("rounds", roundsData);
        response.put("generatedAt", java.time.Instant.now());
        
        return response;
    }
    
    /**
     * Convert tables to response format
     */
    private List<Map<String, Object>> convertTablesToResponse(List<Table> tables) {
        List<Map<String, Object>> tablesData = new ArrayList<>();
        
        for (int tableNum = 0; tableNum < tables.size(); tableNum++) {
            Table table = tables.get(tableNum);
            
            Map<String, Object> tableData = new HashMap<>();
            tableData.put("tableNumber", tableNum + 1);
            
            List<Map<String, Object>> participants = table.getParticipants().stream()
                .map(p -> {
                    Map<String, Object> participant = new HashMap<>();
                    participant.put("profileId", p.getId());
                    participant.put("firstName", p.getFirstName());
                    participant.put("lastName", p.getLastName());
                    participant.put("gender", p.getGender());
                    return participant;
                })
                .collect(Collectors.toList());
            
            tableData.put("participants", participants);
            tableData.put("males", table.getMales().stream()
                .map(p -> Map.of(
                    "profileId", p.getId(),
                    "name", p.getFirstName() + " " + p.getLastName()
                ))
                .collect(Collectors.toList()));
            tableData.put("females", table.getFemales().stream()
                .map(p -> Map.of(
                    "profileId", p.getId(),
                    "name", p.getFirstName() + " " + p.getLastName()
                ))
                .collect(Collectors.toList()));
            
            tablesData.add(tableData);
        }
        
        return tablesData;
    }
} 