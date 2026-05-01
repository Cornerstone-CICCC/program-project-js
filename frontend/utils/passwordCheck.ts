export const checkPasswordStrength = (password: string) => {
  let score = 0;
  if (!password) return { score, label: "None", color: "#e5e7eb" };

  if (password.length >= 8) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const strength = [
    { label: "Very Weak", color: "#ef4444" },
    { label: "Weak", color: "#fb923c" },
    { label: "Good", color: "#facc15" },
    { label: "Strong", color: "#4ade80" },
    { label: "Very Strong", color: "#22c55e" },
  ];

  return { score, ...strength[score - 1] };
};
