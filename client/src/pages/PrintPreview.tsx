import { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, Printer, Grid3X3, PartyPopper } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useGames, useGameCards } from "@/hooks/use-cards";
import { CardPreview } from "@/components/CardPreview";
import { Header } from "@/components/Header";

interface TCGAttributes {
  type: "monster" | "spell" | "trap";
  attack: number;
  hp: number;
  effect: string;
}

interface PCGAttributes {
  type: string;
  action: string;
  effect: string;
  winCondition: string;
  playerCount: string;
  difficulty: string;
  layout?: {
    textSize?: string;
    backgroundColor?: string;
    fontFamily?: string;
    textColor?: string;
    header?: {
      backgroundColor?: string;
      textColor?: string;
      borderRadius?: string;
    };
    footer?: {
      backgroundColor?: string;
      textColor?: string;
      visible?: boolean;
    };
  };
}

const fontOptions = [
  { value: "gothic", family: "'Rajdhani', sans-serif" },
  { value: "mincho", family: "'Libre Baskerville', 'Playfair Display', serif" },
  { value: "rounded", family: "'DM Sans', sans-serif" },
  { value: "handwriting", family: "'Architects Daughter', cursive" },
  { value: "cinzel", family: "'Cinzel', serif" },
  { value: "orbitron", family: "'Orbitron', sans-serif" },
];

const getResolvedFont = (family: string) => {
  const found = fontOptions.find(f => f.value === family);
  return found?.family || "'Rajdhani', sans-serif";
};

const getTextSizes = (size: string) => {
  const sizeMap: Record<string, { title: string; body: string; label: string }> = {
    xs: { title: "14px", body: "10px", label: "8px" },
    small: { title: "16px", body: "12px", label: "9px" },
    medium: { title: "20px", body: "14px", label: "10px" },
    large: { title: "24px", body: "16px", label: "11px" },
  };
  return sizeMap[size] || sizeMap.medium;
};

const getBorderRadius = (size: string) => {
  const map: Record<string, string> = {
    none: "0",
    small: "4px",
    medium: "8px",
    large: "16px",
  };
  return map[size] || "0";
};

function isPCGCard(attrs: unknown): attrs is PCGAttributes {
  if (!attrs || typeof attrs !== "object") return false;
  const a = attrs as Record<string, unknown>;
  return typeof a.action === "string" || typeof a.playerCount === "string" || typeof a.winCondition === "string";
}

function PCGPrintCard({ card }: { card: { name: string; frontImageUrl: string; attributes: unknown } }) {
  const attrs = card.attributes as PCGAttributes;
  const layout = attrs.layout || {};
  const bgColor = layout.backgroundColor || "#1e3a5f";
  const textCol = layout.textColor || "#ffffff";
  const fontFamily = getResolvedFont(layout.fontFamily || "gothic");
  const sizes = getTextSizes(layout.textSize || "medium");
  const typeLabel = attrs.type === "action" ? "アクション" : attrs.type === "event" ? "イベント" : "ペナルティ";

  const headerBg = layout.header?.backgroundColor || "";
  const headerText = layout.header?.textColor || textCol;
  const headerRadius = getBorderRadius(layout.header?.borderRadius || "none");
  const footerBg = layout.footer?.backgroundColor || "";
  const footerText = layout.footer?.textColor || textCol;
  const footerVisible = layout.footer?.visible !== false;

  return (
    <div className="w-full aspect-[2.5/3.5]" data-testid={`print-card-${card.name}`}>
      <div className="relative w-full h-full rounded-md border-2 shadow-lg overflow-hidden" style={{ backgroundColor: bgColor, color: textCol, fontFamily }}>
        <div
          className="p-3 flex justify-between items-center border-b border-white/10 backdrop-blur-sm"
          style={{
            backgroundColor: headerBg || "rgba(0,0,0,0.2)",
            borderRadius: headerRadius,
          }}
        >
          <h3 className="font-bold truncate" style={{ fontFamily, color: headerText, fontSize: sizes.title }}>
            {card.name || "名称未設定"}
          </h3>
        </div>

        <div className="px-3 pt-2 flex items-center gap-1.5 flex-wrap">
          <span className="bg-white/20 px-1.5 py-0.5 rounded-md" style={{ color: textCol, fontSize: sizes.label }}>{typeLabel}</span>
          {attrs.playerCount && <span className="bg-white/10 opacity-80 px-1.5 py-0.5 rounded-md" style={{ fontSize: sizes.label }}>{attrs.playerCount}</span>}
          {attrs.difficulty && <span className="bg-white/10 opacity-80 px-1.5 py-0.5 rounded-md" style={{ fontSize: sizes.label }}>{attrs.difficulty === "easy" ? "かんたん" : attrs.difficulty === "normal" ? "ふつう" : "むずかしい"}</span>}
        </div>

        {card.frontImageUrl && (
          <div className="px-3 pt-2">
            <div className="w-full h-20 rounded-md overflow-hidden border border-white/10">
              <img src={card.frontImageUrl} alt={card.name} className="w-full h-full object-cover" />
            </div>
          </div>
        )}

        <div className={`absolute ${footerVisible ? "bottom-7" : "bottom-1"} left-3 right-3 ${card.frontImageUrl ? "top-[50%]" : "top-[35%]"} bg-black/40 rounded-md p-3 border border-white/10 backdrop-blur-md`}>
          <div className="h-full overflow-y-auto space-y-2">
            {attrs.action && (
              <div>
                <p className="opacity-50 uppercase font-['Orbitron'] mb-0.5" style={{ fontSize: sizes.label }}>アクション</p>
                <p className="leading-relaxed opacity-90" style={{ fontFamily, color: textCol, fontSize: sizes.body }}>{attrs.action}</p>
              </div>
            )}
            {attrs.effect && (
              <div>
                <p className="opacity-50 uppercase font-['Orbitron'] mb-0.5" style={{ fontSize: sizes.label }}>効果</p>
                <p className="leading-relaxed opacity-90" style={{ fontFamily, color: textCol, fontSize: sizes.body }}>{attrs.effect}</p>
              </div>
            )}
          </div>
        </div>

        {footerVisible && (
          <div
            className="absolute bottom-0 w-full p-1.5 text-center text-[9px] font-['Orbitron'] uppercase tracking-[0.2em]"
            style={{
              backgroundColor: footerBg || "rgba(0,0,0,0.6)",
              color: footerText,
              opacity: footerBg ? 1 : 0.4,
            }}
          >
            PARTY CARD
          </div>
        )}
      </div>
    </div>
  );
}

export default function PrintPreview() {
  const { data: games, isLoading: gamesLoading } = useGames();
  const [selectedGameId, setSelectedGameId] = useState<number | null>(null);
  const { data: cards, isLoading: cardsLoading } = useGameCards(selectedGameId);

  const selectedGame = games?.find(g => g.id === selectedGameId);
  const isLoading = gamesLoading || cardsLoading;

  return (
    <div className="min-h-screen p-4 md:p-8 space-y-8 max-w-[1400px] mx-auto">
      <header className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <Button data-testid="link-back-home" variant="outline" size="icon" asChild>
            <Link href="/">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <Header size="sm" />
        </div>
        <Button
          data-testid="button-print"
          onClick={() => window.print()}
          disabled={!cards || cards.length === 0}
        >
          <Printer className="w-4 h-4" /> 印刷する
        </Button>
      </header>

      {games && games.length > 0 && (
        <div className="flex items-center gap-4 flex-wrap">
          <p className="text-sm text-muted-foreground" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
            ゲームを選択:
          </p>
          <div className="flex gap-2 flex-wrap">
            {games.map((game) => (
              <Button
                key={game.id}
                variant={selectedGameId === game.id ? "default" : "outline"}
                onClick={() => setSelectedGameId(game.id)}
                data-testid={`button-select-game-${game.id}`}
              >
                {game.title}
              </Button>
            ))}
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      ) : !selectedGameId ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20 space-y-4"
        >
          <Grid3X3 className="w-16 h-16 mx-auto text-muted-foreground/30" />
          <p className="text-muted-foreground" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
            {games && games.length > 0
              ? "上のボタンからプレビューするゲームを選択してください。"
              : "カードがありません。まず「創作」からカードを作成してください。"}
          </p>
          {(!games || games.length === 0) && (
            <Link href="/create" data-testid="link-create-card" className="inline-block text-primary text-sm underline">
              カードを作成する
            </Link>
          )}
        </motion.div>
      ) : !cards || cards.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20 space-y-4"
        >
          <Grid3X3 className="w-16 h-16 mx-auto text-muted-foreground/30" />
          <p className="text-muted-foreground" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
            このゲームにはまだカードがありません。
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 print:grid-cols-3 print:gap-4">
          {cards.map((card) => {
            const attrs = card.attributes;

            if (isPCGCard(attrs)) {
              return (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-full max-w-xs mx-auto"
                >
                  <PCGPrintCard card={{ name: card.name, frontImageUrl: card.frontImageUrl || card.imageUrl || "", attributes: attrs }} />
                </motion.div>
              );
            }

            const tcgAttrs = attrs as TCGAttributes | null;
            return (
              <motion.div
                key={card.id}
                data-testid={`print-card-${card.name}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-xs mx-auto"
              >
                <CardPreview
                  name={card.name}
                  attack={tcgAttrs?.attack ?? 0}
                  hp={tcgAttrs?.hp ?? 0}
                  effect={tcgAttrs?.effect ?? card.description ?? ""}
                  type={(tcgAttrs?.type as "monster" | "spell" | "trap") ?? "monster"}
                />
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
