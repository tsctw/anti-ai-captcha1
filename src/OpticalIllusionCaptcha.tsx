import React, { useState } from "react";
import { Status, Result } from "./App";

export const OpticalIllusionCaptcha = ({
  onAnswer,
  status,
  colors
}: {
  onAnswer: (result: Result) => void;
  status: Status;
  colors: { color1: string; color2: string };
}) => {
  const [answered, setAnswered] = useState(false);
  const [correct, setCorrect] = useState(false);

  const handleChoice = (choice: "same" | "different") => {
    const isCorrect =
      (status === Status.SAME && choice === "same") ||
      (status === Status.DIFFERENT && choice === "different") ||
      (status === Status.DISTINGUISHED && choice === "different");

    setAnswered(true);
    setCorrect(isCorrect);

    onAnswer({
      correct: isCorrect,
      color1: colors.color1,
      color2: colors.color2,
      status,
    });
  };

  return (
    <>
    <div className="captcha-card">
      <div className="cube-scene small">
        <div className="cube top" style={{ background: colors.color1 }}>
          <span style={{ color: '#000' }}>A</span>
        </div>
        <div className="cube bottom" style={{ background: colors.color2 }}>
          <span style={{ color: '#fff' }}>B</span>
        </div>
      </div>
    </div>
    <div className="choices">
        <button onClick={() => handleChoice("same")}>Same Color</button>
        <button onClick={() => handleChoice("different")}>Different</button>
      </div>
    {answered && (
        <div style={{marginTop: '20px'}} >{correct ? "✅ You are Correct!" : "❌ You are Wrong!"}</div>
      )}
    </>
  );
};
