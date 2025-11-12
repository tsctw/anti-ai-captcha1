import React, { useState } from "react";
import { OpticalIllusionCaptcha } from "./OpticalIllusionCaptcha";

export enum Status {
  SAME = "same",
  DIFFERENT = "different",
  DISTINGUISHED = "distinguished",
}

export type Result = {
  correct: boolean;
  color1: string;
  color2: string;
  status: Status;
};

const randomColor = () => {
  const steps = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e"];
  const rand =
    steps[Math.floor(Math.random() * steps.length)] +
    steps[Math.floor(Math.random() * steps.length)];
  return `#${rand}${rand}${rand}`;
};

function shiftHexColor(hex: string, offset = 7) {
  const steps = ["0","1","2","3","4","5","6","7","8","9","a","b","c","d","e","f"];
  hex = hex.replace("#", "").toLowerCase();
  let shifted = "";
  for (const ch of hex) {
    const idx = steps.indexOf(ch);
    shifted += steps[(idx + offset) % steps.length];
  }
  return "#" + shifted;
}

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const questionList: Status[] = [
  Status.SAME,
  Status.SAME,
  Status.DIFFERENT,
  Status.DIFFERENT,
  Status.DISTINGUISHED,
];

type HandleAnswer = (result: Result) => void;

type ListCaptchasProps = {
  currentIndex: number;
  handleAnswer: HandleAnswer;
  shuffledList: Status[];
};

const ListCaptchas: React.FC<ListCaptchasProps> = ({
  currentIndex,
  handleAnswer,
  shuffledList,
}) => {
  const value = shuffledList[currentIndex];
  const colors = { color1: "", color2: "" };

  if (value === Status.SAME) {
    colors.color1 = randomColor();
    colors.color2 = colors.color1;
  } else if (value === Status.DIFFERENT) {
    colors.color1 = randomColor();
    colors.color2 = randomColor();
  } else {
    colors.color1 = randomColor();
    colors.color2 = shiftHexColor(colors.color1);
  }

  return (
    <OpticalIllusionCaptcha
      key={currentIndex}
      onAnswer={handleAnswer}
      status={value}
      colors={colors}
    />
  );
};

function IsHuman({ answers }: { answers: Result[] }) {
  let score = 0;
  let scoreHuman = 0;
  answers.forEach((ans) => {
    if (ans.status === Status.DISTINGUISHED && !ans.correct) scoreHuman -= 1;
    else if (ans.status === Status.SAME && !ans.correct) scoreHuman += 1;
    else if (ans.correct) score += 1;
  });

  if (scoreHuman < 0)
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
}

function Results({ answers }: { answers: Result[] }) {
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
      <IsHuman answers={answers}/>
    </div>
  );
}

export default function App() {
  const [answers, setAnswers] = useState<Result[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [shuffledList] = useState(() => shuffleArray(questionList));

  const handleAnswer: HandleAnswer = (result) => {
    setAnswers((prev) => [...prev, result]);
    setCurrentIndex((prev) => prev + 1);
  };

  return (
    <div style={{ textAlign: "center" }}>
      {currentIndex < shuffledList.length ? (
        <>
          <h2>{`Color CAPTCHA ${currentIndex + 1}/${shuffledList.length}`}</h2>
          <ListCaptchas
            currentIndex={currentIndex}
            handleAnswer={handleAnswer}
            shuffledList={shuffledList}
          />
        </>
      ) : (
        <Results answers={answers} />
      )}
    </div>
  );
}
