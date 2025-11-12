import React, { useState } from "react";
import { OpticalIllusionCaptcha } from "./OpticalIllusionCaptcha";

// 狀態列舉
export enum Status {
  SAME = "same",
  DIFFERENT = "different",
  DISTINGUISHED = "distinguished",
}

// 回傳結果類型
export type Result = {
  correct: boolean;
  color1: string;
  color2: string;
  status: Status;
};

// 🔹 隨機產生灰階顏色
const randomColor = () => {
  const steps = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e"];
  const rand =
    steps[Math.floor(Math.random() * steps.length)] +
    steps[Math.floor(Math.random() * steps.length)];
  return `#${rand}${rand}${rand}`;
};

// 🔹 產生明暗對比色（位移 7）
const shiftHexColor = (hex: string, offset = 7) => {
  const steps = ["0","1","2","3","4","5","6","7","8","9","a","b","c","d","e","f"];
  hex = hex.replace("#", "").toLowerCase();
  let shifted = "";
  for (const ch of hex) {
    const idx = steps.indexOf(ch);
    shifted += steps[(idx + offset) % steps.length];
  }
  return "#" + shifted;
};

// 🔹 隨機洗牌
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// 題目類型列表
const questionList: Status[] = [
  Status.SAME,
  Status.SAME,
  Status.DIFFERENT,
  Status.DIFFERENT,
  Status.DISTINGUISHED,
  Status.DISTINGUISHED,
];

// 題目與顏色的組合
type QuizItem = {
  status: Status;
  colors: { color1: string; color2: string };
};

// 🔹 一次生成所有題目與顏色（避免閃爍）
const generateQuiz = (): QuizItem[] => {
  const shuffled = shuffleArray(questionList);
  return shuffled.map((status) => {
    const colors = { color1: "", color2: "" };
    if (status === Status.SAME) {
      colors.color1 = randomColor();
      colors.color2 = colors.color1;
    } else if (status === Status.DIFFERENT) {
      colors.color1 = randomColor();
      do {
        colors.color2 = randomColor();
      } while (colors.color1 === colors.color2);
    } else {
      colors.color1 = randomColor();
      colors.color2 = shiftHexColor(colors.color1);
    }
    return { status, colors };
  });
};

// 🔹 判定是否為人類
const IsHuman = ({ answers }: { answers: Result[] }) => {
  let score = 0;
  let scoreHuman = 0;
  answers.forEach((ans) => {
    if (ans.status === Status.DISTINGUISHED && !ans.correct) scoreHuman -= 1;
    else if (ans.status === Status.SAME && ans.correct) scoreHuman -= 1;
    else if (ans.correct) score += 1;
  });

  if (scoreHuman < -1)
    return (
      <>
        <div>You seem to be an AI (BOT).</div>
        <div>Captcha test failed.</div>
      </>
    );
  if (score >= 4)
    return (
      <>
        <div>You seem to be a Human.</div>
        <div>Captcha test passed!</div>
      </>
    );
  return (
    <>
      <div>You seem to be a Human.</div>
      <div>But Captcha test failed.</div>
    </>
  );
};

// 🔹 顯示最終結果
const Results = ({ answers }: { answers: Result[] }) => {
  const correctCount = answers.filter((a) => a.correct).length;
  return (
    <div>
      <h3>Test finished!</h3>
      <p>You answered {correctCount} / {answers.length} correctly.</p>
      <ul style={{ textAlign: "left", display: "inline-block" }}>
        {answers.map((ans, i) => (
          <li key={i}>
            Q{i + 1}: {ans.correct ? "✅ Correct" : "❌ Wrong"} — 
            A={ans.color1}, B={ans.color2}
          </li>
        ))}
      </ul>
      <IsHuman answers={answers} />
    </div>
  );
};

// 🔹 主組件
export default function ColorCaptchaApp() {
  const [answers, setAnswers] = useState<Result[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [quizData, setQuizData] = useState<QuizItem[]>(generateQuiz());

  // 回答事件
  const handleAnswer = (result: Result) => {
    setAnswers((prev) => [...prev, result]);
    // setCurrentIndex((prev) => prev + 1);
    setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
    }, 500);
  };

  // 重新開始
  const restart = () => {
    setAnswers([]);
    setCurrentIndex(0);
    setQuizData(generateQuiz());
  };

  return (
    <div style={{ textAlign: "center" }}>
      {currentIndex < quizData.length ? (
        <>
          <h2>{`Color CAPTCHA ${currentIndex + 1}/${quizData.length}`}</h2>
          <h4>Are area A and B the same color?</h4>
          <OpticalIllusionCaptcha
            key={currentIndex}
            onAnswer={handleAnswer}
            status={quizData[currentIndex].status}
            colors={quizData[currentIndex].colors}
          />
        </>
      ) : (
        <>
          <Results answers={answers} />
          <button
            onClick={restart}
            style={{
              marginTop: "20px",
              padding: "8px 16px",
              borderRadius: "8px",
              background: "#4caf50",
              color: "white",
              fontWeight: "600",
              border: "none",
              cursor: "pointer",
            }}
          >
            Restart
          </button>
        </>
      )}
    </div>
  );
}
