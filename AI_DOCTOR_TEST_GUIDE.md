# AI Doctor (IntelliAid) Testing Guide

## Overview
The AI Health Assistant uses Groq's Llama Vision model to analyze medical images and answer health-related questions.

## Prerequisites
Make sure you have the following environment variables set in your `.env` file:
```
VITE_GROQ_LINK=https://api.groq.com/openai/v1/chat/completions
VITE_GROQ_API_KEY=your_groq_api_key_here
```

## How to Test

### 1. Start the Application
```bash
# In the Client directory
npm run dev
```

### 2. Login/Register
- Navigate to the app
- Login or register a new account
- You no longer need email verification to access AI Doctor!

### 3. Access AI Doctor
- Click on **"AI Doctor"** in the navbar, OR
- Navigate directly to `/AIHealthAssistant`

---

## Sample Test Cases

### Test Case 1: Skin Rash Analysis
**Image**: Upload a photo of a skin rash (you can use a sample image from Google Images)
**Question**: "What could be causing this rash? Is it serious?"

**Expected Response**: The AI should analyze the image and provide possible causes like:
- Allergic reaction
- Eczema
- Contact dermatitis
- Recommendations to see a dermatologist if severe

---

### Test Case 2: Headache Symptoms
**Image**: Upload an image showing someone holding their head (or any relevant image)
**Question**: "I've been having severe headaches for 3 days with sensitivity to light. What could this be?"

**Expected Response**: The AI might suggest:
- Migraine
- Tension headache
- Possible dehydration
- Recommendation to consult a doctor if symptoms persist

---

### Test Case 3: Wound Assessment
**Image**: Upload a photo of a minor cut or wound
**Question**: "Is this wound healing properly? Should I be concerned about infection?"

**Expected Response**: The AI should assess:
- Signs of infection (redness, swelling, pus)
- Healing progress
- When to seek medical attention
- Basic wound care tips

---

### Test Case 4: General Health Question (No Image)
**Image**: Upload any placeholder image
**Question**: "What are the symptoms of diabetes? Should I get tested?"

**Expected Response**: The AI should provide:
- Common diabetes symptoms (frequent urination, excessive thirst, fatigue)
- Risk factors
- Recommendation to get blood sugar tested

---

### Test Case 5: Mental Health - Anxiety & Sleep Issues
**Image**: Upload any calming image (nature, peaceful scene)
**Question**: "I've been feeling anxious and having trouble sleeping for the past 2 weeks. What can I do?"

**Expected Response**: The AI might suggest:
- Relaxation techniques (progressive muscle relaxation, meditation)
- Sleep hygiene tips (consistent bedtime, avoid screens)
- Breathing exercises (4-7-8 technique)
- When to seek professional help (if symptoms persist or worsen)
- Lifestyle changes (exercise, reduce caffeine)

---

### Test Case 6: Mental Health - Depression Symptoms
**Image**: Upload any image (person looking sad, or any neutral image)
**Question**: "I've lost interest in activities I used to enjoy, feel tired all the time, and have trouble concentrating. Could this be depression?"

**Expected Response**: The AI should identify:
- Classic depression symptoms (anhedonia, fatigue, concentration issues)
- Recommendation to take a PHQ-9 screening test
- Importance of seeking professional help
- Self-care strategies as complementary support
- When to seek immediate help (if having suicidal thoughts)

---

### Test Case 7: Mental Health - Stress Management
**Image**: Upload any work-related or busy scene image
**Question**: "I'm overwhelmed with work and personal responsibilities. How can I manage stress better?"

**Expected Response**: The AI might provide:
- Time management techniques
- Prioritization strategies
- Stress-reduction activities (exercise, hobbies)
- Mindfulness and meditation practices
- Setting boundaries
- When stress becomes a mental health concern

---

### Test Case 8: Mental Health - Panic Attacks
**Image**: Upload any image
**Question**: "I sometimes get sudden episodes of intense fear with rapid heartbeat, sweating, and feeling like I can't breathe. What is this?"

**Expected Response**: The AI should recognize:
- Symptoms consistent with panic attacks
- Difference between panic attacks and anxiety
- Grounding techniques (5-4-3-2-1 method)
- Breathing exercises for immediate relief
- Importance of professional evaluation
- Possible underlying anxiety disorders

---

### Test Case 9: Mental Health - Social Anxiety
**Image**: Upload image of a crowd or social gathering
**Question**: "I get extremely nervous in social situations and avoid them. I worry people are judging me. Is this normal?"

**Expected Response**: The AI should address:
- Social anxiety disorder symptoms
- Difference between shyness and social anxiety
- Cognitive behavioral therapy (CBT) as effective treatment
- Gradual exposure techniques
- When to seek professional help
- Support groups and resources

---

### Test Case 10: Mental Health - Burnout
**Image**: Upload any image of tired person or workplace
**Question**: "I feel emotionally exhausted, cynical about my job, and my performance has dropped. What's happening to me?"

**Expected Response**: The AI should identify:
- Signs of burnout (emotional exhaustion, depersonalization, reduced accomplishment)
- Difference between burnout and depression
- Recovery strategies (rest, boundaries, reconnecting with purpose)
- Importance of taking breaks
- When to consider professional help or job change

---

## Testing Without Real Medical Images

If you don't have medical images, you can:
1. Use stock photos from free image sites like Unsplash or Pexels
2. Use generic images and ask text-based health questions
3. The AI will still provide helpful responses based on the question alone

---

## Sample Questions to Test

### General Health
- "What are the warning signs of a heart attack?"
- "How can I boost my immune system naturally?"
- "What causes high blood pressure?"

### Symptoms
- "I have a persistent cough for 2 weeks. Should I be worried?"
- "What could cause sudden dizziness and nausea?"
- "I have chest pain when I breathe deeply. What could it be?"

### Preventive Care
- "What vaccines should adults get?"
- "How often should I get a health checkup?"
- "What are the best foods for heart health?"

### Mental Health (Comprehensive Questions)

**Depression & Mood Disorders:**
- "How do I know if I have depression or just sadness?"
- "What's the difference between feeling sad and clinical depression?"
- "I cry for no reason and feel hopeless. What should I do?"
- "Can depression be cured completely?"

**Anxiety Disorders:**
- "What are effective ways to manage anxiety attacks?"
- "I worry constantly about everything. Is this normal?"
- "How can I stop overthinking at night?"
- "What's the difference between normal worry and anxiety disorder?"

**Stress & Burnout:**
- "What are effective ways to manage stress?"
- "How do I know if I'm experiencing burnout?"
- "I feel overwhelmed all the time. What can help?"

**Therapy & Treatment:**
- "When should I seek therapy?"
- "What's the difference between a psychologist and psychiatrist?"
- "How do I know if I need medication for my mental health?"
- "What is cognitive behavioral therapy (CBT)?"

**Self-Harm & Crisis:**
- "I've been having thoughts of self-harm. What should I do?"
- "How can I help a friend who is suicidal?"
- "What are warning signs of a mental health crisis?"

**Relationships & Social:**
- "How do I deal with social anxiety?"
- "I feel lonely even when surrounded by people. Why?"
- "How can I set healthy boundaries with toxic people?"

**Trauma & PTSD:**
- "What are signs of PTSD?"
- "How do I cope with past trauma?"
- "Can childhood trauma affect me as an adult?"

**Sleep & Mental Health:**
- "Why does anxiety make it hard to sleep?"
- "I have nightmares every night. What does this mean?"
- "How much sleep do I need for good mental health?"

**Lifestyle & Coping:**
- "What foods are good for mental health?"
- "Can exercise really help with depression?"
- "What are healthy coping mechanisms for stress?"
- "How can I practice mindfulness?"

---

## Important Notes

⚠️ **Disclaimer**: This AI assistant is for informational purposes only and should not replace professional medical advice.

✅ **Fixed Issues**:
- Removed account verification requirement
- Users can now access immediately after login
- Fixed syntax error in the API call

🎯 **Features**:
- Image upload and analysis
- Text-based health questions
- Powered by Groq's Llama Vision model
- Real-time AI responses

---

## Troubleshooting

### Issue: "Model failed" error
**Solution**: Check that your GROQ_API_KEY is valid and has credits

### Issue: Can't access AI Doctor
**Solution**: Make sure you're logged in. The verification requirement has been removed.

### Issue: Image not uploading
**Solution**: Make sure the image is in a supported format (JPG, PNG, etc.)

---

## Quick Test Command

To quickly test if the feature is working:
1. Login to the app
2. Navigate to AI Doctor
3. Upload any image (even a screenshot)
4. Ask: "What are the symptoms of the common cold?"
5. Click Submit and wait for response

The AI should provide a detailed answer about cold symptoms regardless of the image content.
