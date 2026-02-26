import { type BalanceRequest } from "@shared/schema";
import { Sword, Heart, Type, Sparkles, Wand2, Shield, Skull } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface InputFormProps {
  values: BalanceRequest;
  onChange: (values: BalanceRequest) => void;
  nameError?: string;
}

const typeLabels: Record<string, string> = {
  monster: "モンスター",
  spell: "魔法",
  trap: "罠",
};

export function InputForm({ values, onChange, nameError }: InputFormProps) {
  const handleChange = (field: keyof BalanceRequest, value: string | number) => {
    onChange({ ...values, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-['Orbitron'] tracking-wider text-muted-foreground flex items-center gap-2">
          <Type className="w-4 h-4 text-primary" /> カード名
        </label>
        <input
          data-testid="input-card-name"
          value={values.name}
          onChange={(e) => handleChange("name", e.target.value)}
          placeholder="カード名を入力..."
          className={`w-full bg-black/20 border-2 ${nameError ? "border-destructive focus:border-destructive focus:ring-destructive/10" : "border-border/50 focus:border-primary focus:ring-primary/10"} rounded-lg px-4 py-3 text-lg font-['Cinzel'] font-bold focus:outline-none focus:ring-4 transition-all placeholder:text-muted-foreground/50`}
        />
        {nameError && (
          <p className="text-xs text-destructive mt-1">{nameError}</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-['Orbitron'] tracking-wider text-muted-foreground flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-secondary" /> カードタイプ
        </label>
        <div className="grid grid-cols-3 gap-2">
          {(["monster", "spell", "trap"] as const).map((type) => (
            <Button
              key={type}
              data-testid={`button-type-${type}`}
              variant="outline"
              onClick={() => handleChange("type", type)}
              className={`toggle-elevate ${values.type === type ? "toggle-elevated" : ""} flex flex-col items-center gap-1 font-bold text-sm tracking-wide`}
            >
              {type === 'monster' && <Skull className="w-5 h-5" />}
              {type === 'spell' && <Wand2 className="w-5 h-5" />}
              {type === 'trap' && <Shield className="w-5 h-5" />}
              {typeLabels[type]}
            </Button>
          ))}
        </div>
      </div>

      {values.type === "monster" && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="grid grid-cols-2 gap-4"
        >
          <div className="space-y-2">
            <label className="text-sm font-['Orbitron'] tracking-wider text-muted-foreground flex items-center gap-2">
              <Sword className="w-4 h-4 text-red-500" /> 攻撃力
            </label>
            <div className="relative">
              <input
                data-testid="input-attack"
                type="number"
                min="0"
                max="10"
                value={values.attack}
                onChange={(e) => handleChange("attack", Number(e.target.value))}
                className="w-full bg-black/20 border-2 border-border/50 rounded-lg pl-4 pr-3 py-3 text-2xl font-['Orbitron'] font-bold text-red-400 focus:border-red-500/50 focus:outline-none focus:ring-4 focus:ring-red-500/10 transition-all"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-mono">/ 10</div>
            </div>
            <input
              data-testid="input-attack-range"
              type="range" min="0" max="10" 
              value={values.attack} 
              onChange={(e) => handleChange("attack", Number(e.target.value))}
              className="w-full accent-red-500 h-1.5 bg-black/40 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-['Orbitron'] tracking-wider text-muted-foreground flex items-center gap-2">
              <Heart className="w-4 h-4 text-blue-500" /> HP
            </label>
            <div className="relative">
              <input
                data-testid="input-hp"
                type="number"
                min="0"
                max="10"
                value={values.hp}
                onChange={(e) => handleChange("hp", Number(e.target.value))}
                className="w-full bg-black/20 border-2 border-border/50 rounded-lg pl-4 pr-3 py-3 text-2xl font-['Orbitron'] font-bold text-blue-400 focus:border-blue-500/50 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-mono">/ 10</div>
            </div>
            <input
              data-testid="input-hp-range"
              type="range" min="0" max="10" 
              value={values.hp} 
              onChange={(e) => handleChange("hp", Number(e.target.value))}
              className="w-full accent-blue-500 h-1.5 bg-black/40 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </motion.div>
      )}

      <div className="space-y-2">
        <label className="text-sm font-['Orbitron'] tracking-wider text-muted-foreground flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-accent" /> 効果説明
        </label>
        <textarea
          data-testid="input-effect"
          value={values.effect}
          onChange={(e) => handleChange("effect", e.target.value)}
          placeholder="このカードの効果を記述..."
          rows={5}
          className="w-full bg-black/20 border-2 border-border/50 rounded-lg px-4 py-3 text-base leading-relaxed resize-none focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/10 transition-all placeholder:text-muted-foreground/50"
        />
      </div>
    </div>
  );
}
