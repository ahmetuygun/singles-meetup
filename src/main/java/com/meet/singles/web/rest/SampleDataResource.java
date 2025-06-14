package com.meet.singles.web.rest;

import com.meet.singles.service.SampleDataGeneratorService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class SampleDataResource {

    private static final Logger log = LoggerFactory.getLogger(SampleDataResource.class);
    
    private final SampleDataGeneratorService sampleDataGeneratorService;
    
    public SampleDataResource(SampleDataGeneratorService sampleDataGeneratorService) {
        this.sampleDataGeneratorService = sampleDataGeneratorService;
    }
    
    /**
     * Generate sample users with random questionnaire answers
     * 
     * @param numberOfUsers the number of users to generate (will be made even for gender balance)
     * @return the result of sample data generation
     */
    @PostMapping("/sample-data/generate/{numberOfUsers}")
    public ResponseEntity<Map<String, Object>> generateSampleData(@PathVariable int numberOfUsers) {
        log.debug("REST request to generate {} sample users", numberOfUsers);
        
        try {
            Map<String, Object> result = sampleDataGeneratorService.generateSampleData(numberOfUsers);
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Error generating sample data", e);
            return ResponseEntity.internalServerError().body(Map.of(
                "error", "Failed to generate sample data: " + e.getMessage()
            ));
        }
    }
    
    /**
     * Generate sample users with request body
     * 
     * @param request the request containing numberOfUsers OR maleCount and femaleCount
     * @return the result of sample data generation
     */
    @PostMapping("/sample-data/generate")
    public ResponseEntity<Map<String, Object>> generateSampleDataWithBody(@RequestBody Map<String, Object> request) {
        log.debug("REST request to generate sample users with body: {}", request);
        
        try {
            // Check if specific male/female counts are provided
            Object maleCountObj = request.get("maleCount");
            Object femaleCountObj = request.get("femaleCount");
            
            if (maleCountObj != null && femaleCountObj != null) {
                // Generate with specific male/female counts
                int maleCount = parseIntegerFromObject(maleCountObj, "maleCount");
                int femaleCount = parseIntegerFromObject(femaleCountObj, "femaleCount");
                
                Map<String, Object> result = sampleDataGeneratorService.generateSampleData(maleCount, femaleCount);
                return ResponseEntity.ok(result);
            } else {
                // Fall back to numberOfUsers (balanced generation)
                Object numberOfUsersObj = request.get("numberOfUsers");
                if (numberOfUsersObj == null) {
                    return ResponseEntity.badRequest().body(Map.of(
                        "error", "Either 'numberOfUsers' OR both 'maleCount' and 'femaleCount' are required",
                        "examples", Map.of(
                            "balanced", "{\"numberOfUsers\": 10}",
                            "specific", "{\"maleCount\": 6, \"femaleCount\": 4}"
                        )
                    ));
                }
                
                int numberOfUsers = parseIntegerFromObject(numberOfUsersObj, "numberOfUsers");
                Map<String, Object> result = sampleDataGeneratorService.generateSampleData(numberOfUsers);
                return ResponseEntity.ok(result);
            }
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Error generating sample data", e);
            return ResponseEntity.internalServerError().body(Map.of(
                "error", "Failed to generate sample data: " + e.getMessage()
            ));
        }
    }
    
    /**
     * Generate sample users with specific male and female counts
     * 
     * @param maleCount number of male users to generate
     * @param femaleCount number of female users to generate
     * @return the result of sample data generation
     */
    @PostMapping("/sample-data/generate/{maleCount}/{femaleCount}")
    public ResponseEntity<Map<String, Object>> generateSampleDataWithGenderCounts(
            @PathVariable int maleCount, @PathVariable int femaleCount) {
        log.debug("REST request to generate {} male and {} female users", maleCount, femaleCount);
        
        try {
            Map<String, Object> result = sampleDataGeneratorService.generateSampleData(maleCount, femaleCount);
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Error generating sample data with gender counts", e);
            return ResponseEntity.internalServerError().body(Map.of(
                "error", "Failed to generate sample data: " + e.getMessage()
            ));
        }
    }
    
    /**
     * Helper method to parse integer from object
     */
    private int parseIntegerFromObject(Object obj, String fieldName) {
        if (obj instanceof Number) {
            return ((Number) obj).intValue();
        } else if (obj instanceof String) {
            try {
                return Integer.parseInt((String) obj);
            } catch (NumberFormatException e) {
                throw new IllegalArgumentException(fieldName + " must be a valid number");
            }
        } else {
            throw new IllegalArgumentException(fieldName + " must be a number");
        }
    }
    
    /**
     * Get information about sample data generation
     * 
     * @return information about the sample data generation feature
     */
    @GetMapping("/sample-data/info")
    public ResponseEntity<Map<String, Object>> getSampleDataInfo() {
        Map<String, Object> info = Map.of(
            "description", "Generate sample users with random questionnaire answers",
            "endpoints", Map.of(
                "POST /api/sample-data/generate/{numberOfUsers}", "Generate specified number of sample users (balanced)",
                "POST /api/sample-data/generate/{maleCount}/{femaleCount}", "Generate specific number of males and females",
                "POST /api/sample-data/generate", "Generate sample users with request body",
                "GET /api/sample-data/info", "Get this information"
            ),
            "features", Map.of(
                "genderBalance", "Can generate balanced or specific gender distributions",
                "randomAnswers", "Generates random answers from available question options",
                "realNames", "Uses realistic first and last names",
                "ageRange", "Generates ages between 22-45 years",
                "maxUsers", 100,
                "questionnaireFull", "Answers all available questions in the system"
            ),
            "usage", Map.of(
                "balanced1", "POST /api/sample-data/generate/10 - generates 10 users (5M + 5F)",
                "balanced2", "POST /api/sample-data/generate with body {\"numberOfUsers\": 20}",
                "specific1", "POST /api/sample-data/generate/6/4 - generates 6 males and 4 females",
                "specific2", "POST /api/sample-data/generate with body {\"maleCount\": 8, \"femaleCount\": 12}",
                "note", "For balanced generation, odd numbers will be increased by 1"
            ),
            "requestBodyExamples", Map.of(
                "balanced", "{\"numberOfUsers\": 20}",
                "specific", "{\"maleCount\": 15, \"femaleCount\": 10}",
                "note", "Use either 'numberOfUsers' OR both 'maleCount' and 'femaleCount'"
            )
        );
        
        return ResponseEntity.ok(info);
    }
} 