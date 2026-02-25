import { Type, Sparkles, Users, Target, Gauge, Zap, CalendarClock, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface PCGFormData {
  name: string;
  action: string;
  winCondition: string;
  playerCount: string;
  difficulty: string;
  type: string;
  effect: string;
}

interface PCGInputFormProps {
  values: PCGFormData;
  onChange: (values: PCGFormData) => void;
}

const typeLabels: Record<string, string> = {
  action: "アクション",
  event: "イベント",
  penalty: "ペナルティ",
};

const difficultyLabels: Record<string, string> = {
  easy: "かんたん",
  normal: "ふつう",
  hard: "むずかしい",
};

export function PCGInputForm({ values, onChange }: PCGInputFormProps) {
  const handleChange = (field: keyof PCGFormData, value: string) => {
    onChange({ ...values, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-['Orbitron'] tracking-wider text-muted-foreground flex items-center gap-2">
          <Type className="w-4 h-4 text-primary" /> カード名
        </label>
        <input
          data-testid="input-pcg-name"
          value={values.name}
          onChange={(e) => handleChange("name", e.target.value)}
          placeholder="カード名を入力..."
          className="w-full bg-black/20 border-2 border-border/50 rounded-lg px-4 py-3 text-lg font-bold focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-muted-foreground/50"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-['Orbitron'] tracking-wider text-muted-foreground flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-secondary" /> カードタイプ
        </label>
        <div className="grid grid-cols-3 gap-2">
          {(["action", "event", "penalty"] as const).map((type) => (
            <Button
              key={type}
              data-testid={`button-pcg-type-${type}`}
              variant="outline"
              onClick={() => handleChange("type", type)}
              className={`toggle-elevate ${values.type === type ? "toggle-elevated" : ""} flex flex-col items-center gap-1 font-bold text-sm tracking-wide`}
            >
              {type === 'action' && <Zap className="w-5 h-5" />}
              {type === 'event' && <CalendarClock className="w-5 h-5" />}
              {type === 'penalty' && <AlertTriangle className="w-5 h-5" />}
              {typeLabels[type]}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-['Orbitron'] tracking-wider text-muted-foreground flex items-center gap-2">
          <Target className="w-4 h-4 text-accent" /> アクション内容
        </label>
        <textarea
          data-testid="input-pcg-action"
          value={values.action}
          onChange={(e) => handleChange("action", e.target.value)}
          placeholder="このカードのアクションを記述..."
          rows={3}
          className="w-full bg-black/20 border-2 border-border/50 rounded-lg px-4 py-3 text-base leading-relaxed resize-none focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/10 transition-all placeholder:text-muted-foreground/50"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-['Orbitron'] tracking-wider text-muted-foreground flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" /> 効果説明
        </label>
        <textarea
          data-testid="input-pcg-effect"
          value={values.effect}
          onChange={(e) => handleChange("effect", e.target.value)}
          placeholder="このカードの効果やルールを記述..."
          rows={3}
          className="w-full bg-black/20 border-2 border-border/50 rounded-lg px-4 py-3 text-base leading-relaxed resize-none focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/10 transition-all placeholder:text-muted-foreground/50"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-['Orbitron'] tracking-wider text-muted-foreground flex items-center gap-2">
          <Target className="w-4 h-4 text-green-500" /> 勝利条件
        </label>
        <input
          data-testid="input-pcg-win-condition"
          value={values.winCondition}
          onChange={(e) => handleChange("winCondition", e.target.value)}
          placeholder="勝利条件を入力..."
          className="w-full bg-black/20 border-2 border-border/50 rounded-lg px-4 py-3 text-base focus:border-green-500/50 focus:outline-none focus:ring-4 focus:ring-green-500/10 transition-all placeholder:text-muted-foreground/50"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-['Orbitron'] tracking-wider text-muted-foreground flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-500" /> プレイ人数
          </label>
          <input
            data-testid="input-pcg-player-count"
            value={values.playerCount}
            onChange={(e) => handleChange("playerCount", e.target.value)}
            placeholder="例: 2〜6人"
            className="w-full bg-black/20 border-2 border-border/50 rounded-lg px-4 py-3 text-base focus:border-blue-500/50 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-muted-foreground/50"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-['Orbitron'] tracking-wider text-muted-foreground flex items-center gap-2">
            <Gauge className="w-4 h-4 text-orange-500" /> 難易度
          </label>
          <div className="grid grid-cols-1 gap-1">
            {(["easy", "normal", "hard"] as const).map((diff) => (
              <Button
                key={diff}
                data-testid={`button-pcg-difficulty-${diff}`}
                variant="outline"
                size="sm"
                onClick={() => handleChange("difficulty", diff)}
                className={`toggle-elevate ${values.difficulty === diff ? "toggle-elevated" : ""} text-xs`}
              >
                {difficultyLabels[diff]}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
