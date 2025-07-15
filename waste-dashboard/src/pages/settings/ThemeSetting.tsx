import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import { useTheme } from "../../contexts/ThemeContext";
import type {Mode, Accent } from "../../contexts/ThemeContext";
import { Button } from "../../components/ui/button";

const ACCENTS: Accent[] = ["blue", "green", "purple", "rose"];

export default function ThemeSettings() {
  const { mode, accent, setMode, setAccent } = useTheme();

  return (
    <div className="max-w-xl mx-auto space-y-8 p-6">
      <Card>
        <CardHeader>
          <CardTitle>表示モード</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-3">
          {(["light", "dark"] as Mode[]).map((m) => (
            <Button
              key={m}
              variant={mode === m ? "default" : "secondary"}
              onClick={() => setMode(m)}
              className="capitalize"
            >
              {m}
            </Button>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>アクセントカラー</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-3 flex-wrap">
          {ACCENTS.map((a) => (
            <button
              key={a}
              onClick={() => setAccent(a)}
              className={`w-10 h-10 rounded-full ring-2 ${
                accent === a ? "ring-accent" : "ring-transparent"
              }`}
              style={{ backgroundColor: `var(--accent, ${a})` }}
              aria-label={a}
            />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
