import { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, Printer, Grid3X3 } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useGames, useGameCards } from "@/hooks/use-cards";
import { CardPreview } from "@/components/CardPreview";
import { Header } from "@/components/Header";
import {
  type PCGDesignSettings,
  getCardStyle, getTextSizes, getBorderRadius, getResolvedFont,
} from "@/lib/pcgCardStyle";

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
  layout?: PCGDesignSettings;
}

function isPCGCard(attrs: unknown): attrs is PCGAttributes {
  if (!attrs || typeof attrs !== "object") return false;
  const a = attrs as Record<string, unknown>;
  return typeof a.action === "string" || typeof a.playerCount === "string" || typeof a.winCondition === "string";
}

function PCGPrintCard({ card }: { card: { name: string; frontImageUrl: string; attributes: unknown } }) {
  const attrs = card.attributes as PCGAttributes;
  const layout = (attrs.layout || {}) as PCGDesignSettings;
  const cs = getCardStyle(layout);
  const fontFamily = getResolvedFont(layout.fontFamily || "gothic");
  const sizes = getTextSizes(layout.textSize || "medium");
  const typeLabel = attrs.type === "action" ? "アクション" : attrs.type === "event" ? "イベント" : "ペナルティ";
  const headerRadius = getBorderRadius(layout.header?.borderRadius || "none");
  const footerVisible = layout.footer?.visible !== false;

  return (
    <div className="w-full aspect-[2.5/3.5]" data-testid={`print-card-${card.name}`}>
      <div
        className="relative w-full h-full rounded-md border-2 shadow-lg overflow-hidden flex flex-col"
        style={{ backgroundColor: cs.background, borderColor: cs.border, color: cs.bodyText, fontFamily }}
      >
        {/* Header */}
        <div
          className="shrink-0 p-2 flex justify-between items-center border-b border-white/10"
          style={{ backgroundColor: cs.titleBg, borderRadius: headerRadius }}
        >
          <h3 className="font-bold truncate" style={{ color: cs.titleText, fontSize: sizes.title, fontFamily }}>
            {card.name || "名称未設定"}
          </h3>
          <span
            className="ml-2 shrink-0 px-1.5 py-0.5 rounded-md font-bold"
            style={{ backgroundColor: cs.accent, color: "#fff", fontSize: sizes.label, fontFamily: "'Orbitron', sans-serif" }}
          >
            {typeLabel}
          </span>
        </div>

        {/* Image — flex-1 (image-first layout) */}
        <div
          className="flex-1 min-h-0 mx-2 mt-2 rounded-md overflow-hidden"
          style={{ backgroundColor: cs.imageFrame }}
        >
          {card.frontImageUrl ? (
            <img src={card.frontImageUrl} alt={card.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center opacity-20">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            </div>
          )}
        </div>

        {/* Tags */}
        <div className="shrink-0 flex items-center gap-1 px-2 pt-1 flex-wrap">
          {attrs.playerCount && (
            <span className="px-1.5 py-0.5 rounded-md" style={{ backgroundColor: "rgba(255,255,255,0.1)", color: cs.bodyText, fontSize: sizes.label }}>
              {attrs.playerCount}
            </span>
          )}
          {attrs.difficulty && (
            <span className="px-1.5 py-0.5 rounded-md" style={{ backgroundColor: "rgba(255,255,255,0.1)", color: cs.bodyText, fontSize: sizes.label }}>
              {attrs.difficulty === "easy" ? "かんたん" : attrs.difficulty === "normal" ? "ふつう" : "むずかしい"}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="shrink-0 max-h-[22%] overflow-y-auto px-2 pt-1 pb-1 space-y-1">
          {attrs.action && (
            <div>
              <p className="opacity-50 uppercase mb-0.5" style={{ fontFamily: "'Orbitron', sans-serif", fontSize: sizes.label }}>アクション</p>
              <p className="leading-relaxed opacity-90" style={{ color: cs.bodyText, fontSize: sizes.body, fontFamily }}>{attrs.action}</p>
            </div>
          )}
          {attrs.effect && (
            <div>
              <p className="opacity-50 uppercase mb-0.5" style={{ fontFamily: "'Orbitron', sans-serif", fontSize: sizes.label }}>効果</p>
              <p className="leading-relaxed opacity-90" style={{ color: cs.bodyText, fontSize: sizes.body, fontFamily }}>{attrs.effect}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        {footerVisible && (
          <div
            className="shrink-0 w-full p-1.5 text-center uppercase tracking-[0.2em]"
            style={{
              backgroundColor: layout.footer?.backgroundColor || cs.accent + "33",
              color: layout.footer?.textColor || cs.accent,
              fontSize: "9px",
              fontFamily: "'Orbitron', sans-serif",
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
