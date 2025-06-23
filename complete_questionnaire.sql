-- =============================================
-- Complete Personality Assessment Questionnaire
-- Questions and Answer Options
-- =============================================

-- =============================================
-- INSERT TEST QUESTIONS
-- =============================================

INSERT INTO public.test_question
(id, question_text, question_type, step_number, is_required, category, "language", editable)
VALUES(6087, 'Welcome to our personality assessment! This questionnaire will help us understand your preferences and match you with compatible people at our events. Please answer all questions honestly for the best results.', 'INFO', 0, false, 'INTRODUCTION', 'en', true);

INSERT INTO public.test_question
(id, question_text, question_type, step_number, is_required, category, "language", editable)
VALUES(14050, 'What is your name?', 'TEXT_INPUT', 1, true, 'USERNAME', 'en', false);

INSERT INTO public.test_question
(id, question_text, question_type, step_number, is_required, category, "language", editable)
VALUES(14100, 'What is your gender?', 'SINGLE_CHOICE', 2, true, 'GENDER', 'en', false);

INSERT INTO public.test_question
(id, question_text, question_type, step_number, is_required, category, "language", editable)
VALUES(14350, 'What is your date of birth?', 'DATE_INPUT', 3, true, 'DOB', 'en', false);

INSERT INTO public.test_question
(id, question_text, question_type, step_number, is_required, category, "language", editable)
VALUES(6001, 'How do you usually make decisions?', 'SINGLE_CHOICE', 4, true, 'PERSONALITY_COMMUNICATION', 'en', true);

INSERT INTO public.test_question
(id, question_text, question_type, step_number, is_required, category, "language", editable)
VALUES(6004, 'Are you more of a thinker or feeler?', 'SINGLE_CHOICE', 5, true, 'PERSONALITY_COMMUNICATION', 'en', true);

INSERT INTO public.test_question
(id, question_text, question_type, step_number, is_required, category, "language", editable)
VALUES(6007, 'How do you handle unexpected changes?', 'SINGLE_CHOICE', 6, true, 'PERSONALITY_COMMUNICATION', 'en', true);

INSERT INTO public.test_question
(id, question_text, question_type, step_number, is_required, category, "language", editable)
VALUES(6010, 'How outgoing are you?', 'ONE_TO_FIVE', 7, true, 'PERSONALITY_COMMUNICATION', 'en', true);

INSERT INTO public.test_question
(id, question_text, question_type, step_number, is_required, category, "language", editable)
VALUES(6013, 'How important are deep conversations to you?', 'ONE_TO_FIVE', 8, true, 'PERSONALITY_COMMUNICATION', 'en', true);

INSERT INTO public.test_question
(id, question_text, question_type, step_number, is_required, category, "language", editable)
VALUES(6016, 'How romantic are you?', 'ONE_TO_FIVE', 9, true, 'PERSONALITY_COMMUNICATION', 'en', true);

INSERT INTO public.test_question
(id, question_text, question_type, step_number, is_required, category, "language", editable)
VALUES(6019, 'How physically active are you?', 'ONE_TO_FIVE', 10, true, 'LIFESTYLE_HABITS', 'en', true);

INSERT INTO public.test_question
(id, question_text, question_type, step_number, is_required, category, "language", editable)
VALUES(6022, 'What''s your ideal weekend like?', 'SINGLE_CHOICE', 11, true, 'LIFESTYLE_HABITS', 'en', true);

INSERT INTO public.test_question
(id, question_text, question_type, step_number, is_required, category, "language", editable)
VALUES(6025, 'How often do you feel stressed?', 'ONE_TO_FIVE', 12, true, 'LIFESTYLE_HABITS', 'en', true);

INSERT INTO public.test_question
(id, question_text, question_type, step_number, is_required, category, "language", editable)
VALUES(6028, 'How important is physical touch in a relationship?', 'ONE_TO_FIVE', 13, true, 'LIFESTYLE_HABITS', 'en', true);

INSERT INTO public.test_question
(id, question_text, question_type, step_number, is_required, category, "language", editable)
VALUES(6031, 'Do you enjoy edgy or politically incorrect humor?', 'ONE_TO_FIVE', 14, true, 'LIFESTYLE_HABITS', 'en', true);

INSERT INTO public.test_question
(id, question_text, question_type, step_number, is_required, category, "language", editable)
VALUES(6034, 'How creative do you consider yourself?', 'ONE_TO_FIVE', 15, true, 'LIFESTYLE_HABITS', 'en', true);

INSERT INTO public.test_question
(id, question_text, question_type, step_number, is_required, category, "language", editable)
VALUES(6037, 'How important is family in your life?', 'ONE_TO_FIVE', 16, true, 'VALUES_RELATIONSHIP_ATTITUDES', 'en', true);

INSERT INTO public.test_question
(id, question_text, question_type, step_number, is_required, category, "language", editable)
VALUES(6040, 'How spiritual or religious are you?', 'ONE_TO_FIVE', 17, true, 'VALUES_RELATIONSHIP_ATTITUDES', 'en', true);

INSERT INTO public.test_question
(id, question_text, question_type, step_number, is_required, category, "language", editable)
VALUES(6043, 'How important is it that your partner shares your values?', 'ONE_TO_FIVE', 18, true, 'VALUES_RELATIONSHIP_ATTITUDES', 'en', true);

INSERT INTO public.test_question
(id, question_text, question_type, step_number, is_required, category, "language", editable)
VALUES(6046, 'How important is it to have shared hobbies with a partner?', 'ONE_TO_FIVE', 19, true, 'VALUES_RELATIONSHIP_ATTITUDES', 'en', true);

INSERT INTO public.test_question
(id, question_text, question_type, step_number, is_required, category, "language", editable)
VALUES(6049, 'How driven or ambitious are you?', 'ONE_TO_FIVE', 20, true, 'VALUES_RELATIONSHIP_ATTITUDES', 'en', true);

INSERT INTO public.test_question
(id, question_text, question_type, step_number, is_required, category, "language", editable)
VALUES(6052, 'What is your relationship status?', 'SINGLE_CHOICE', 21, true, 'IDENTITY_RELATIONSHIP_INTENTIONS', 'en', true);

INSERT INTO public.test_question
(id, question_text, question_type, step_number, is_required, category, "language", editable)
VALUES(6056, 'Do you want to have (more) children?', 'SINGLE_CHOICE', 22, true, 'IDENTITY_RELATIONSHIP_INTENTIONS', 'en', true);

INSERT INTO public.test_question
(id, question_text, question_type, step_number, is_required, category, "language", editable)
VALUES(6061, 'What are you looking for right now?', 'SINGLE_CHOICE', 23, true, 'IDENTITY_RELATIONSHIP_INTENTIONS', 'en', true);

INSERT INTO public.test_question
(id, question_text, question_type, step_number, is_required, category, "language", editable)
VALUES(6066, 'Do you smoke or vape?', 'SINGLE_CHOICE', 24, true, 'IDENTITY_RELATIONSHIP_INTENTIONS', 'en', true);

INSERT INTO public.test_question
(id, question_text, question_type, step_number, is_required, category, "language", editable)
VALUES(6070, 'Do you drink alcohol?', 'SINGLE_CHOICE', 25, true, 'IDENTITY_RELATIONSHIP_INTENTIONS', 'en', true);

INSERT INTO public.test_question
(id, question_text, question_type, step_number, is_required, category, "language", editable)
VALUES(6079, 'What genders are you open to dating?', 'SINGLE_CHOICE', 26, true, 'VALUES_RELATIONSHIP_ATTITUDES', 'en', true);

INSERT INTO public.test_question
(id, question_text, question_type, step_number, is_required, category, "language", editable)
VALUES(6085, 'Where are you from?', 'COUNTRY_SELECTION', 29, true, 'IDENTITY_RELATIONSHIP_INTENTIONS', 'en', true);

INSERT INTO public.test_question
(id, question_text, question_type, step_number, is_required, category, "language", editable)
VALUES(6086, 'What is your profession?', 'JOB_SELECTION', 30, true, 'JOB', 'en', false);

INSERT INTO public.test_question
(id, question_text, question_type, step_number, is_required, category, "language", editable)
VALUES(6088, 'Thank you for completing our personality assessment! Your responses will help us create better matches and recommend events that align with your interests. Click Submit to finish.', 'INFO', 31, false, 'CONCLUSION', 'en', true);

-- =============================================
-- INSERT ANSWER OPTIONS
-- =============================================

-- Gender options (Question ID: 14100)
INSERT INTO public.test_answer_option (id, option_text, value, question_id) VALUES(14150, 'Male', 1, 14100);
INSERT INTO public.test_answer_option (id, option_text, value, question_id) VALUES(14200, 'Female', 2, 14100);
INSERT INTO public.test_answer_option (id, option_text, value, question_id) VALUES(14250, 'Non-binary', 3, 14100);
INSERT INTO public.test_answer_option (id, option_text, value, question_id) VALUES(14300, 'Prefer not to say', 4, 14100);

-- Decision making options (Question ID: 6001)
INSERT INTO public.test_answer_option (id, option_text, value, question_id) VALUES(6002, 'Based on logic', 1, 6001);
INSERT INTO public.test_answer_option (id, option_text, value, question_id) VALUES(6003, 'Based on emotions', 2, 6001);

-- Thinker or feeler options (Question ID: 6004)
INSERT INTO public.test_answer_option (id, option_text, value, question_id) VALUES(6005, 'Thinker', 1, 6004);
INSERT INTO public.test_answer_option (id, option_text, value, question_id) VALUES(6006, 'Feeler', 2, 6004);

-- Handling changes options (Question ID: 6007)
INSERT INTO public.test_answer_option (id, option_text, value, question_id) VALUES(6008, 'I like plans', 1, 6007);
INSERT INTO public.test_answer_option (id, option_text, value, question_id) VALUES(6009, 'I go with the flow', 2, 6007);

-- Outgoing options (Question ID: 6010) - ONE_TO_FIVE scale
INSERT INTO public.test_answer_option (id, option_text, value, question_id) VALUES(6011, 'Very introverted', 1, 6010);
INSERT INTO public.test_answer_option (id, option_text, value, question_id) VALUES(6012, 'Very extroverted', 2, 6010);

-- Deep conversations options (Question ID: 6013) - ONE_TO_FIVE scale
INSERT INTO public.test_answer_option (id, option_text, value, question_id) VALUES(6014, 'Not important', 1, 6013);
INSERT INTO public.test_answer_option (id, option_text, value, question_id) VALUES(6015, 'Very important', 2, 6013);

-- Romantic options (Question ID: 6016) - ONE_TO_FIVE scale
INSERT INTO public.test_answer_option (id, option_text, value, question_id) VALUES(6017, 'Not romantic', 1, 6016);
INSERT INTO public.test_answer_option (id, option_text, value, question_id) VALUES(6018, 'Extremely romantic', 2, 6016);

-- Physical activity options (Question ID: 6019) - ONE_TO_FIVE scale
INSERT INTO public.test_answer_option (id, option_text, value, question_id) VALUES(6020, 'Not active', 1, 6019);
INSERT INTO public.test_answer_option (id, option_text, value, question_id) VALUES(6021, 'Very active', 2, 6019);

-- Weekend preferences options (Question ID: 6022)
INSERT INTO public.test_answer_option (id, option_text, value, question_id) VALUES(6023, 'Relaxing and quiet', 1, 6022);
INSERT INTO public.test_answer_option (id, option_text, value, question_id) VALUES(6024, 'Out and social', 2, 6022);

-- Stress level options (Question ID: 6025) - ONE_TO_FIVE scale
INSERT INTO public.test_answer_option (id, option_text, value, question_id) VALUES(6026, 'Rarely', 1, 6025);
INSERT INTO public.test_answer_option (id, option_text, value, question_id) VALUES(6027, 'Very often', 2, 6025);

-- Physical touch importance options (Question ID: 6028) - ONE_TO_FIVE scale
INSERT INTO public.test_answer_option (id, option_text, value, question_id) VALUES(6029, 'Not important', 1, 6028);
INSERT INTO public.test_answer_option (id, option_text, value, question_id) VALUES(6030, 'Very important', 2, 6028);

-- Edgy humor options (Question ID: 6031) - ONE_TO_FIVE scale
INSERT INTO public.test_answer_option (id, option_text, value, question_id) VALUES(6032, 'Not at all', 1, 6031);
INSERT INTO public.test_answer_option (id, option_text, value, question_id) VALUES(6033, 'I love it', 2, 6031);

-- Creativity options (Question ID: 6034) - ONE_TO_FIVE scale
INSERT INTO public.test_answer_option (id, option_text, value, question_id) VALUES(6035, 'Not at all', 1, 6034);
INSERT INTO public.test_answer_option (id, option_text, value, question_id) VALUES(6036, 'Very creative', 2, 6034);

-- Family importance options (Question ID: 6037) - ONE_TO_FIVE scale
INSERT INTO public.test_answer_option (id, option_text, value, question_id) VALUES(6038, 'Not important', 1, 6037);
INSERT INTO public.test_answer_option (id, option_text, value, question_id) VALUES(6039, 'Very important', 2, 6037);

-- Spirituality/Religion options (Question ID: 6040) - ONE_TO_FIVE scale
INSERT INTO public.test_answer_option (id, option_text, value, question_id) VALUES(6041, 'Not at all', 1, 6040);
INSERT INTO public.test_answer_option (id, option_text, value, question_id) VALUES(6042, 'Very much', 2, 6040);

-- Shared values importance options (Question ID: 6043) - ONE_TO_FIVE scale
INSERT INTO public.test_answer_option (id, option_text, value, question_id) VALUES(6044, 'Not important', 1, 6043);
INSERT INTO public.test_answer_option (id, option_text, value, question_id) VALUES(6045, 'Very important', 2, 6043);

-- Shared hobbies importance options (Question ID: 6046) - ONE_TO_FIVE scale
INSERT INTO public.test_answer_option (id, option_text, value, question_id) VALUES(6047, 'Not important', 1, 6046);
INSERT INTO public.test_answer_option (id, option_text, value, question_id) VALUES(6048, 'Very important', 2, 6046);

-- Ambition options (Question ID: 6049) - ONE_TO_FIVE scale
INSERT INTO public.test_answer_option (id, option_text, value, question_id) VALUES(6050, 'Not at all', 1, 6049);
INSERT INTO public.test_answer_option (id, option_text, value, question_id) VALUES(6051, 'Very much', 2, 6049);

-- Relationship status options (Question ID: 6052)
INSERT INTO public.test_answer_option (id, option_text, value, question_id) VALUES(6053, 'Single', 1, 6052);
INSERT INTO public.test_answer_option (id, option_text, value, question_id) VALUES(6054, 'In a relationship', 2, 6052);
INSERT INTO public.test_answer_option (id, option_text, value, question_id) VALUES(6055, 'Prefer not to say', 3, 6052);

-- Children options (Question ID: 6056)
INSERT INTO public.test_answer_option (id, option_text, value, question_id) VALUES(6057, 'No', 1, 6056);
INSERT INTO public.test_answer_option (id, option_text, value, question_id) VALUES(6058, 'Yes', 2, 6056);
INSERT INTO public.test_answer_option (id, option_text, value, question_id) VALUES(6059, 'Not sure', 3, 6056);
INSERT INTO public.test_answer_option (id, option_text, value, question_id) VALUES(6060, 'Prefer not to say', 4, 6056);

-- Looking for options (Question ID: 6061)
INSERT INTO public.test_answer_option (id, option_text, value, question_id) VALUES(6062, 'Long-term relationship', 1, 6061);
INSERT INTO public.test_answer_option (id, option_text, value, question_id) VALUES(6063, 'Dating with potential', 2, 6061);
INSERT INTO public.test_answer_option (id, option_text, value, question_id) VALUES(6064, 'Something casual', 3, 6061);
INSERT INTO public.test_answer_option (id, option_text, value, question_id) VALUES(6065, 'Just meeting people', 4, 6061);

-- Smoking/Vaping options (Question ID: 6066)
INSERT INTO public.test_answer_option (id, option_text, value, question_id) VALUES(6067, 'Yes', 1, 6066);
INSERT INTO public.test_answer_option (id, option_text, value, question_id) VALUES(6068, 'No', 2, 6066);
INSERT INTO public.test_answer_option (id, option_text, value, question_id) VALUES(6069, 'Occasionally', 3, 6066);

-- Drinking options (Question ID: 6070)
INSERT INTO public.test_answer_option (id, option_text, value, question_id) VALUES(6071, 'Yes', 1, 6070);
INSERT INTO public.test_answer_option (id, option_text, value, question_id) VALUES(6072, 'No', 2, 6070);
INSERT INTO public.test_answer_option (id, option_text, value, question_id) VALUES(6073, 'Occasionally', 3, 6070);

-- Dating gender preferences options (Question ID: 6079)
INSERT INTO public.test_answer_option (id, option_text, value, question_id) VALUES(6080, 'Women', 1, 6079);
INSERT INTO public.test_answer_option (id, option_text, value, question_id) VALUES(6081, 'Men', 2, 6079);
INSERT INTO public.test_answer_option (id, option_text, value, question_id) VALUES(6082, 'Everyone', 3, 6079);
INSERT INTO public.test_answer_option (id, option_text, value, question_id) VALUES(6083, 'Prefer not to say', 4, 6079);

-- =============================================
-- SUMMARY
-- =============================================
-- Total Questions: 30
-- Total Answer Options: 59
-- Question Categories:
--   - INTRODUCTION (1)
--   - USERNAME (1) - TEXT_INPUT
--   - GENDER (1) - SINGLE_CHOICE with 4 options
--   - DOB (1) - DATE_INPUT
--   - PERSONALITY_COMMUNICATION (6)
--   - LIFESTYLE_HABITS (6)
--   - VALUES_RELATIONSHIP_ATTITUDES (6)
--   - IDENTITY_RELATIONSHIP_INTENTIONS (7)
--   - JOB (1) - JOB_SELECTION
--   - CONCLUSION (1)
-- ============================================= 