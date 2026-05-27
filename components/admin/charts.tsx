"use client";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

const COLORS = ["#22d3ee", "#3b82f6", "#a855f7", "#34d399", "#fbbf24", "#f472b6"];

const tooltipStyle = {
  background: "rgba(10,13,22,.95)",
  border: "1px solid rgba(255,255,255,.1)",
  borderRadius: 12,
  color: "#eef2f8",
  fontSize: 13,
};

export function GrowthChart({ data }: { data: { date: string; users: number; products: number; ai: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.06)" />
        <XAxis dataKey="date" stroke="#5d6884" fontSize={12} tickLine={false} />
        <YAxis stroke="#5d6884" fontSize={12} tickLine={false} allowDecimals={false} />
        <Tooltip contentStyle={tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Line type="monotone" dataKey="users" name="İstifadəçi" stroke="#22d3ee" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="products" name="Məhsul" stroke="#a855f7" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="ai" name="AI" stroke="#34d399" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function CategoryBarChart({ data }: { data: { name: string; value: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.06)" vertical={false} />
        <XAxis dataKey="name" stroke="#5d6884" fontSize={11} tickLine={false} interval={0} angle={-15} textAnchor="end" height={50} />
        <YAxis stroke="#5d6884" fontSize={12} tickLine={false} allowDecimals={false} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(255,255,255,.03)" }} />
        <Bar dataKey="value" name="Məhsul" radius={[6, 6, 0, 0]}>
          {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function StatusPieChart({ data }: { data: { name: string; value: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3}>
          {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="transparent" />)}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
