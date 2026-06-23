// hooks/useAutoAiAnswer.js
// Drop this hook in your hooks/ folder.
// Call it from your AskQuestion page after a question is successfully posted.
//
// Usage:
//   const triggerAiAnswer = useAutoAiAnswer();
//   // after your api.post("/api/questions") succeeds:
//   triggerAiAnswer({ question_id, title, body, subject, experience_level, question_type });

import api from "../utils/api";

const useAutoAiAnswer = () => {
  const trigger = async ({ question_id, title, body, subject, experience_level, question_type }) => {
    try {
      await api.post("/api/ai/auto-answer", {
        question_id,
        title,
        body,
        subject: subject || "",
        experience_level: experience_level || "",
        question_type: question_type || "",
      });
    } catch (err) {
      // Silently fail — auto-answer is a bonus, not critical
      console.error("Auto AI answer failed:", err);
    }
  };

  return trigger;
};

export default useAutoAiAnswer;
