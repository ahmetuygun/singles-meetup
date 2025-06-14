package com.meet.singles.service;

import com.meet.singles.domain.PersonProfile;
import com.meet.singles.domain.UserTestAnswer;
import com.meet.singles.repository.UserTestAnswerRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class CompatibilityService {

    private static final Logger log = LoggerFactory.getLogger(CompatibilityService.class);
    
    private final UserTestAnswerRepository userTestAnswerRepository;
    
    // Question IDs for compatibility calculation
    private static final Long Q_DECISION_MAKING = 6001L;  // Logic vs Emotions
    private static final Long Q_THINKER_FEELER = 6004L;   // Thinker vs Feeler
    private static final Long Q_INTROVERT_EXTROVERT = 6010L; // Introversion scale
    private static final Long Q_ENERGY_LEVEL = 6013L;     // Energy level
    private static final Long Q_SOCIAL_ACTIVITY = 6022L;  // Social activities
    private static final Long Q_ADVENTURE_LEVEL = 6019L;  // Adventure level
    private static final Long Q_LIFESTYLE_PACE = 6028L;   // Lifestyle pace
    private static final Long Q_RELATIONSHIP_GOALS = 6037L; // Relationship goals
    private static final Long Q_COMMUNICATION_STYLE = 6061L; // Communication style
    private static final Long Q_CONFLICT_RESOLUTION = 6079L; // Conflict resolution
    
    // Maximum scores for normalization
    private static final double MAX_PERSONALITY_SCORE = 19.5; // 2+1.5+5+5
    private static final double MAX_LIFESTYLE_SCORE = 12.0;   // 2+5+5
    private static final double MAX_VALUES_SCORE = 20.0;     // 5+3+2
    
    public CompatibilityService(UserTestAnswerRepository userTestAnswerRepository) {
        this.userTestAnswerRepository = userTestAnswerRepository;
    }
    
    /**
     * Calculate compatibility matrix for all participants
     */
    public double[][] calculateCompatibilityMatrix(List<PersonProfile> participants) {
        int size = participants.size();
        double[][] matrix = new double[size][size];
        
        // Load all answers for participants
        Map<Long, Map<Long, Integer>> participantAnswers = loadParticipantAnswers(participants);
        
        for (int i = 0; i < size; i++) {
            for (int j = i + 1; j < size; j++) {
                PersonProfile p1 = participants.get(i);
                PersonProfile p2 = participants.get(j);
                
                double score = calculatePairScore(
                    participantAnswers.get(p1.getId()),
                    participantAnswers.get(p2.getId())
                );
                
                matrix[i][j] = score;
                matrix[j][i] = score;
            }
        }
        
        log.debug("Calculated compatibility matrix for {} participants", size);
        return matrix;
    }
    
    /**
     * Load all relevant answers for participants
     */
    private Map<Long, Map<Long, Integer>> loadParticipantAnswers(List<PersonProfile> participants) {
        Map<Long, Map<Long, Integer>> result = new HashMap<>();
        
        Set<Long> relevantQuestions = Set.of(
            Q_DECISION_MAKING, Q_THINKER_FEELER, Q_INTROVERT_EXTROVERT, Q_ENERGY_LEVEL,
            Q_SOCIAL_ACTIVITY, Q_ADVENTURE_LEVEL, Q_LIFESTYLE_PACE,
            Q_RELATIONSHIP_GOALS, Q_COMMUNICATION_STYLE, Q_CONFLICT_RESOLUTION
        );
        
        for (PersonProfile participant : participants) {
            List<UserTestAnswer> answers = userTestAnswerRepository.findByPersonProfile(participant);
            Map<Long, Integer> answerMap = answers.stream()
                .filter(answer -> relevantQuestions.contains(answer.getQuestion().getId()))
                .filter(answer -> answer.getAnswerValue() != null)
                .collect(Collectors.toMap(
                    answer -> answer.getQuestion().getId(),
                    UserTestAnswer::getAnswerValue
                ));
            result.put(participant.getId(), answerMap);
        }
        
        return result;
    }
    
    /**
     * Calculate compatibility score between two participants
     */
    private double calculatePairScore(Map<Long, Integer> p1Answers, Map<Long, Integer> p2Answers) {
        double totalScore = 0;
        
        // Personality (40% weight)
        double personalityScore = 0;
        personalityScore += compareAnswer(p1Answers.get(Q_DECISION_MAKING), p2Answers.get(Q_DECISION_MAKING)) * 2;
        personalityScore += compareAnswer(p1Answers.get(Q_THINKER_FEELER), p2Answers.get(Q_THINKER_FEELER)) * 1.5;
        personalityScore += (5 - Math.abs(getAnswerValue(p1Answers, Q_INTROVERT_EXTROVERT) - getAnswerValue(p2Answers, Q_INTROVERT_EXTROVERT)));
        personalityScore += (5 - Math.abs(getAnswerValue(p1Answers, Q_ENERGY_LEVEL) - getAnswerValue(p2Answers, Q_ENERGY_LEVEL)));
        totalScore += (personalityScore / MAX_PERSONALITY_SCORE) * 40;
        
        // Lifestyle (30% weight)
        double lifestyleScore = 0;
        lifestyleScore += compareAnswer(p1Answers.get(Q_SOCIAL_ACTIVITY), p2Answers.get(Q_SOCIAL_ACTIVITY)) * 2;
        lifestyleScore += (5 - Math.abs(getAnswerValue(p1Answers, Q_ADVENTURE_LEVEL) - getAnswerValue(p2Answers, Q_ADVENTURE_LEVEL)));
        lifestyleScore += (5 - Math.abs(getAnswerValue(p1Answers, Q_LIFESTYLE_PACE) - getAnswerValue(p2Answers, Q_LIFESTYLE_PACE)));
        totalScore += (lifestyleScore / MAX_LIFESTYLE_SCORE) * 30;
        
        // Values (30% weight)
        double valuesScore = 0;
        valuesScore += (5 - Math.abs(getAnswerValue(p1Answers, Q_RELATIONSHIP_GOALS) - getAnswerValue(p2Answers, Q_RELATIONSHIP_GOALS)));
        valuesScore += compareAnswer(p1Answers.get(Q_COMMUNICATION_STYLE), p2Answers.get(Q_COMMUNICATION_STYLE)) * 3;
        valuesScore += compareAnswer(p1Answers.get(Q_CONFLICT_RESOLUTION), p2Answers.get(Q_CONFLICT_RESOLUTION)) * 2;
        totalScore += (valuesScore / MAX_VALUES_SCORE) * 30;
        
        return Math.max(0, Math.min(100, totalScore)); // Clamp between 0-100
    }
    
    /**
     * Compare two answers and return compatibility score
     */
    private double compareAnswer(Integer a1, Integer a2) {
        if (a1 == null || a2 == null) return 1; // Default low score for missing answers
        
        if (a1.equals(a2)) return 5;
        if (areSimilar(a1, a2)) return 3;
        return 1;
    }
    
    /**
     * Check if two answers are similar (adjacent values)
     */
    private boolean areSimilar(Integer a1, Integer a2) {
        return Math.abs(a1 - a2) == 1;
    }
    
    /**
     * Get answer value with default fallback
     */
    private int getAnswerValue(Map<Long, Integer> answers, Long questionId) {
        return answers.getOrDefault(questionId, 3); // Default to middle value
    }
} 