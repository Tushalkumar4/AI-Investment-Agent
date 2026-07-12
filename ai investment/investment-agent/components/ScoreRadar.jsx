"use client";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";

export default function ScoreRadar({ businessModel, financialHealth, marketPosition, riskAssessment }) {
  const data = [
    { subject: "Business Model", score: businessModel?.score ?? 0 },
    { subject: "Financial Health", score: financialHealth?.score ?? 0 },
    { subject: "Market Position", score: marketPosition?.score ?? 0 },
    { subject: "Risk (inverted)", score: riskAssessment?.score ?? 0 },
  ];

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="72%">
          <PolarGrid stroke="#1D2330" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: "#8A93A6", fontSize: 11, fontFamily: "IBM Plex Mono, monospace" }}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 10]}
            tick={{ fill: "#4B5263", fontSize: 9 }}
            axisLine={false}
          />
          <Radar
            name="Score"
            dataKey="score"
            stroke="#00D9A3"
            fill="#00D9A3"
            fillOpacity={0.22}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
