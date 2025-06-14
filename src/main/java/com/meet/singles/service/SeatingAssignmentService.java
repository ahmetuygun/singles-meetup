package com.meet.singles.service;

import com.meet.singles.domain.PersonProfile;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class SeatingAssignmentService {

    private static final Logger log = LoggerFactory.getLogger(SeatingAssignmentService.class);
    
    private final CompatibilityService compatibilityService;
    
    public SeatingAssignmentService(CompatibilityService compatibilityService) {
        this.compatibilityService = compatibilityService;
    }
    
    /**
     * Generate seating assignments for 4 rounds
     */
    public List<List<Table>> generateSeatingAssignments(List<PersonProfile> participants) {
        // Separate by gender
        List<PersonProfile> males = participants.stream()
            .filter(p -> "Male".equalsIgnoreCase(p.getGender()))
            .collect(Collectors.toList());
        
        List<PersonProfile> females = participants.stream()
            .filter(p -> "Female".equalsIgnoreCase(p.getGender()))
            .collect(Collectors.toList());
        
        // Validate equal numbers
        if (males.size() != females.size()) {
            throw new IllegalArgumentException("Must have equal number of males and females");
        }
        
        if (males.size() % 2 != 0) {
            throw new IllegalArgumentException("Must have even number of participants of each gender");
        }
        
        // Calculate compatibility matrix
        double[][] compatibilityMatrix = compatibilityService.calculateCompatibilityMatrix(participants);
        
        // Create participant index mapping
        Map<PersonProfile, Integer> participantIndex = new HashMap<>();
        for (int i = 0; i < participants.size(); i++) {
            participantIndex.put(participants.get(i), i);
        }
        
        return generateRounds(males, females, compatibilityMatrix, participantIndex);
    }
    
    /**
     * Generate 4 rounds of seating assignments
     */
    private List<List<Table>> generateRounds(List<PersonProfile> males, List<PersonProfile> females, 
                                           double[][] compatibility, Map<PersonProfile, Integer> participantIndex) {
        
        int numRounds = 4;
        int numTables = males.size() / 2; // 2 males per table
        
        // Track who has met with whom
        boolean[][] metWith = initializeMetWithMatrix(males.size() + females.size());
        
        List<List<Table>> allAssignments = new ArrayList<>();
        
        for (int round = 1; round <= numRounds; round++) {
            log.debug("Generating assignments for round {}", round);
            
            List<Table> roundAssignments = new ArrayList<>();
            List<PersonProfile> availableMales = new ArrayList<>(males);
            List<PersonProfile> availableFemales = new ArrayList<>();
            
            // For rounds after the first, filter females who haven't met the males yet
            if (round == 1) {
                availableFemales.addAll(females);
            } else {
                availableFemales.addAll(females);
            }
            
            for (int table = 1; table <= numTables; table++) {
                if (availableMales.size() < 2 || availableFemales.size() < 2) {
                    log.warn("Not enough participants for table {} in round {}", table, round);
                    break;
                }
                
                // Select first male (or best available)
                PersonProfile m1 = availableMales.remove(0);
                
                // Find best male match for m1
                PersonProfile m2 = findBestMatch(m1, availableMales, compatibility, metWith, participantIndex);
                if (m2 == null) {
                    m2 = availableMales.remove(0); // Fallback to first available
                } else {
                    availableMales.remove(m2);
                }
                
                // Find females who haven't met both males
                List<PersonProfile> possibleFemales = femalesNotMetWith(m1, m2, availableFemales, metWith, participantIndex);
                if (possibleFemales.size() < 2) {
                    possibleFemales = new ArrayList<>(availableFemales); // Fallback to all available
                }
                
                // Find best female pair
                PersonProfile[] femalePair = findBestFemalePair(m1, m2, possibleFemales, compatibility, participantIndex);
                PersonProfile f1 = femalePair[0];
                PersonProfile f2 = femalePair[1];
                
                // Create table
                Table tableAssignment = new Table(Arrays.asList(m1, m2, f1, f2));
                roundAssignments.add(tableAssignment);
                
                // Update met-with matrix
                updateMetWith(tableAssignment.getParticipants(), metWith, participantIndex);
                
                // Remove selected females from available list
                availableFemales.remove(f1);
                availableFemales.remove(f2);
                
                log.debug("Round {}, Table {}: {} & {} with {} & {}", 
                         round, table, 
                         m1.getFirstName(), m2.getFirstName(), 
                         f1.getFirstName(), f2.getFirstName());
            }
            
            allAssignments.add(roundAssignments);
        }
        
        return allAssignments;
    }
    
    /**
     * Find best match for a person from candidates
     */
    private PersonProfile findBestMatch(PersonProfile person, List<PersonProfile> candidates, 
                                      double[][] compatibility, boolean[][] metWith, 
                                      Map<PersonProfile, Integer> participantIndex) {
        
        double bestScore = -1;
        PersonProfile bestMatch = null;
        
        int personIdx = participantIndex.get(person);
        
        for (PersonProfile candidate : candidates) {
            int candidateIdx = participantIndex.get(candidate);
            
            if (metWith[personIdx][candidateIdx]) {
                continue; // Skip if they've already met
            }
            
            double score = compatibility[personIdx][candidateIdx];
            if (score > bestScore) {
                bestScore = score;
                bestMatch = candidate;
            }
        }
        
        return bestMatch;
    }
    
    /**
     * Find best female pair for two males
     */
    private PersonProfile[] findBestFemalePair(PersonProfile m1, PersonProfile m2, 
                                             List<PersonProfile> females, double[][] compatibility,
                                             Map<PersonProfile, Integer> participantIndex) {
        
        if (females.size() < 2) {
            throw new IllegalStateException("Not enough females available");
        }
        
        double bestScore = -1;
        PersonProfile[] bestPair = new PersonProfile[2];
        
        int m1Idx = participantIndex.get(m1);
        int m2Idx = participantIndex.get(m2);
        
        for (int i = 0; i < females.size(); i++) {
            for (int j = i + 1; j < females.size(); j++) {
                PersonProfile f1 = females.get(i);
                PersonProfile f2 = females.get(j);
                
                int f1Idx = participantIndex.get(f1);
                int f2Idx = participantIndex.get(f2);
                
                // Calculate group compatibility score
                double groupScore = compatibility[m1Idx][f1Idx] +
                                  compatibility[m1Idx][f2Idx] +
                                  compatibility[m2Idx][f1Idx] +
                                  compatibility[m2Idx][f2Idx] +
                                  compatibility[f1Idx][f2Idx];
                
                if (groupScore > bestScore) {
                    bestScore = groupScore;
                    bestPair[0] = f1;
                    bestPair[1] = f2;
                }
            }
        }
        
        // Fallback to first two if no best pair found
        if (bestPair[0] == null) {
            bestPair[0] = females.get(0);
            bestPair[1] = females.get(1);
        }
        
        return bestPair;
    }
    
    /**
     * Initialize met-with matrix
     */
    private boolean[][] initializeMetWithMatrix(int size) {
        boolean[][] matrix = new boolean[size][size];
        
        // Mark diagonal as true (person has "met" themselves)
        for (int i = 0; i < size; i++) {
            matrix[i][i] = true;
        }
        
        return matrix;
    }
    
    /**
     * Update met-with matrix for a table
     */
    private void updateMetWith(List<PersonProfile> table, boolean[][] metWith, 
                              Map<PersonProfile, Integer> participantIndex) {
        
        for (int i = 0; i < table.size(); i++) {
            for (int j = i + 1; j < table.size(); j++) {
                int idx1 = participantIndex.get(table.get(i));
                int idx2 = participantIndex.get(table.get(j));
                
                metWith[idx1][idx2] = true;
                metWith[idx2][idx1] = true;
            }
        }
    }
    
    /**
     * Find females who haven't met with both males
     */
    private List<PersonProfile> femalesNotMetWith(PersonProfile m1, PersonProfile m2, 
                                                 List<PersonProfile> females, boolean[][] metWith,
                                                 Map<PersonProfile, Integer> participantIndex) {
        
        int m1Idx = participantIndex.get(m1);
        int m2Idx = participantIndex.get(m2);
        
        return females.stream()
            .filter(f -> {
                int fIdx = participantIndex.get(f);
                return !metWith[m1Idx][fIdx] && !metWith[m2Idx][fIdx];
            })
            .collect(Collectors.toList());
    }
    
    /**
     * Table class to represent seating assignment
     */
    public static class Table {
        private final List<PersonProfile> participants;
        
        public Table(List<PersonProfile> participants) {
            this.participants = new ArrayList<>(participants);
        }
        
        public List<PersonProfile> getParticipants() {
            return participants;
        }
        
        public List<PersonProfile> getMales() {
            return participants.stream()
                .filter(p -> "Male".equalsIgnoreCase(p.getGender()))
                .collect(Collectors.toList());
        }
        
        public List<PersonProfile> getFemales() {
            return participants.stream()
                .filter(p -> "Female".equalsIgnoreCase(p.getGender()))
                .collect(Collectors.toList());
        }
        
        @Override
        public String toString() {
            return "Table{" +
                "participants=" + participants.stream()
                    .map(p -> p.getFirstName() + " " + p.getLastName())
                    .collect(Collectors.joining(", ")) +
                '}';
        }
    }
} 