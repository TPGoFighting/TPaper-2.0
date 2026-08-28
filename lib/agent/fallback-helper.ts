import { DocumentPackage } from "./types";
import { SamplePaper, Question } from "../sample-papers";

export function createFallbackPaperFromDoc(doc: DocumentPackage): SamplePaper {
  const cleanTitle = doc.filename.replace(/\.[^/.]+$/, "").trim() || "上传试卷";
  const text = doc.extractedText || "";
  const lines = text.split("\n").map(l => l.trim()).filter(l => l.length > 0);
  
  const questions: Question[] = [];
  let currentQuestion: any = null;
  let qIdx = 1;

  for (const line of lines) {
    const qMatch = line.match(/^(\d+)[.、\s](.*)/);
    const optMatch = line.match(/^([A-Da-d])[.、\s](.*)/);

    if (qMatch) {
      if (currentQuestion && currentQuestion.question) {
        questions.push({
          id: currentQuestion.id || qIdx++,
          section: "一、试卷题目",
          type: currentQuestion.options && currentQuestion.options.length > 0 ? "single-choice" : "long-answer",
          question: currentQuestion.question,
          options: currentQuestion.options && currentQuestion.options.length > 0 ? currentQuestion.options : undefined,
          correctAnswer: currentQuestion.correctAnswer || (currentQuestion.options ? "A" : "标准参考答案"),
          explanation: currentQuestion.explanation || "【解析】根据题目考查核心概念与专业知识分析得出。",
          points: currentQuestion.options ? 10 : 20,
        });
      }
      currentQuestion = {
        id: parseInt(qMatch[1], 10) || qIdx++,
        question: qMatch[2] || line,
        options: [],
      };
    } else if (optMatch && currentQuestion) {
      currentQuestion.options = currentQuestion.options || [];
      currentQuestion.options.push({
        key: optMatch[1].toUpperCase(),
        text: optMatch[2] || line,
      });
    } else if (currentQuestion && currentQuestion.question) {
      currentQuestion.question += "\n" + line;
    }
  }

  if (currentQuestion && currentQuestion.question) {
    questions.push({
      id: currentQuestion.id || qIdx++,
      section: "一、试卷题目",
      type: currentQuestion.options && currentQuestion.options.length > 0 ? "single-choice" : "long-answer",
      question: currentQuestion.question,
      options: currentQuestion.options && currentQuestion.options.length > 0 ? currentQuestion.options : undefined,
      correctAnswer: currentQuestion.correctAnswer || (currentQuestion.options ? "A" : "标准参考答案"),
      explanation: currentQuestion.explanation || "【解析】根据题目考查核心概念与专业知识分析得出。",
      points: currentQuestion.options ? 10 : 20,
    });
  }

  if (questions.length === 0) {
    questions.push({
      id: 1,
      section: "一、综合试题",
      type: "long-answer",
      question: text.slice(0, 500) || ("请根据《" + cleanTitle + "》要求作答相关理论要点与推导演算过程。"),
      correctAnswer: "标准参考答案",
      explanation: "【解析】针对试卷主旨的核心概念进行论述。",
      points: 100,
    });
  }

  return {
    id: ("paper-" + Math.random().toString(36).substring(2, 8)).toLowerCase(),
    title: cleanTitle,
    subject: cleanTitle.includes("医") || cleanTitle.includes("感觉") || cleanTitle.includes("运动") ? "医学 / 康复学" : "综合学科",
    grade: "大学专业课",
    durationMinutes: 90,
    totalPoints: questions.reduce((sum, q) => sum + q.points, 0) || 100,
    description: "由 tpaper 多模态 AI Agent 针对《" + cleanTitle + "》解析生成的交互式试卷产物。",
    questions,
  };
}
