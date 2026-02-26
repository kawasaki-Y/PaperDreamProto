import { useState, useRef } from "react";
import { InputForm } from "@/components/InputForm";
import { type PCGFormData } from "@/components/PCGInputForm";
import { CardPreview } from "@/components/CardPreview";
import { AIPanel } from "@/components/AIPanel";
import {
  useBalanceCheck, useCreateGame, useCreateCard, useUpdateCard,
  useGame, useGameCards, useDeleteCard, useUploadImage, useGames, DuplicateTitleError
} from "@/hooks/use-cards";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { type BalanceRequest, type BalanceResponse, type Card } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save, Swords, PartyPopper, Plus, Trash2, Pencil, Printer, ImagePlus, RotateCcw } from "lucide-react";
import { Link, useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Header } from "@/components/Header";
import { Card as UICard, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

type GameType = "tcg" | "pcg" | null;

function GameTypeSelector({ onSelect }: { onSelect: (type: "tcg" | "pcg") => void }) {
  return (
    <div className="min-h-screen flex flex-col items-center p-6 relative overflow-x-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
      </div>

      <div className="relative z-10 max-w-3xl w-full pt-16 pb-12 space-y-12">
        <div className="flex items-center gap-4">
          <Button data-testid="link-back-home" variant="outline" size="icon" asChild>
            <Link href="/">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <Header size="sm" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <h2
            className="text-2xl font-bold"
            style={{ fontFamily: "'Orbitron', sans-serif" }}
          >
            作成するカードゲームのタイプを選択
          </h2>
          <p className="text-muted-foreground" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
            ゲームの種類に応じた入力項目が表示されます
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <UICard
            className="hover-elevate active-elevate-2 cursor-pointer overflow-visible"
            onClick={() => onSelect("tcg")}
            data-testid="card-select-tcg"
          >
            <CardContent className="p-8 flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 rounded-md bg-gradient-to-br from-violet-600 to-purple-800 flex items-center justify-center shadow-lg">
                <Swords className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-1" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
                  トレーディングカードゲーム
                </h3>
                <p className="text-xs text-muted-foreground uppercase tracking-[0.2em]" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                  TCG
                </p>
              </div>
              <p className="text-sm text-muted-foreground" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
                攻撃力・HP・効果を持つ対戦型カード
              </p>
              <p className="text-xs text-muted-foreground/60">
                例: 遊戯王、ポケモンカード、MTG
              </p>
            </CardContent>
          </UICard>

          <UICard
            className="hover-elevate active-elevate-2 cursor-pointer overflow-visible"
            onClick={() => onSelect("pcg")}
            data-testid="card-select-pcg"
          >
            <CardContent className="p-8 flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 rounded-md bg-gradient-to-br from-amber-500 to-orange-700 flex items-center justify-center shadow-lg">
                <PartyPopper className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-1" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
                  パーティカードゲーム
                </h3>
                <p className="text-xs text-muted-foreground uppercase tracking-[0.2em]" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                  PCG
                </p>
              </div>
              <p className="text-sm text-muted-foreground" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
                アクション・イベント・ペナルティのパーティ向けカード
              </p>
              <p className="text-xs text-muted-foreground/60">
                例: UNO、人狼、ナンジャモンジャ
              </p>
            </CardContent>
          </UICard>
        </motion.div>
      </div>
    </div>
  );
}

interface TCGAttributes {
  type: "monster" | "spell" | "trap";
  attack: number;
  hp: number;
  effect: string;
}

function TCGEditor({ gameId, onBack }: { gameId: number; onBack: () => void }) {
  const { toast } = useToast();
  const { data: existingCards } = useGameCards(gameId);
  const deleteCardMutation = useDeleteCard();

  const [formData, setFormData] = useState<BalanceRequest>({
    name: "サイバー・ドラゴン",
    attack: 8,
    hp: 5,
    effect: "このカードが召喚された時、相手の魔法カードを1枚破壊する。",
    type: "monster",
  });

  const [suggestion, setSuggestion] = useState<BalanceResponse | null>(null);
  const balanceCheckMutation = useBalanceCheck();
  const createCardMutation = useCreateCard();

  const handleAnalyze = () => {
    balanceCheckMutation.mutate(formData, {
      onSuccess: (data) => {
        setSuggestion(data);
        toast({ title: "分析完了", description: "AIがカード効果に基づいたバランス提案を行いました。" });
      },
      onError: (error) => {
        toast({ variant: "destructive", title: "分析失敗", description: error.message });
      }
    });
  };

  const handleApplySuggestion = (s: BalanceResponse) => {
    setFormData(prev => ({ ...prev, attack: s.suggested_attack, hp: s.suggested_hp }));
    setSuggestion(null);
    toast({ title: "変更を適用", description: "カードのステータスが推奨値に更新されました。" });
  };

  const handleSave = () => {
    const attributes: TCGAttributes = {
      type: formData.type,
      attack: formData.attack,
      hp: formData.hp,
      effect: formData.effect,
    };
    createCardMutation.mutate({
      gameId,
      name: formData.name,
      attributes: attributes as unknown as Record<string, unknown>,
    }, {
      onSuccess: () => {
        toast({
          title: "カードを保存しました",
          description: `「${formData.name}」がゲームに追加されました。`,
          className: "bg-green-600 border-green-700 text-white",
        });
      },
      onError: (error) => {
        toast({ variant: "destructive", title: "保存に失敗しました", description: error.message });
      }
    });
  };

  const handleDeleteCard = (cardId: number) => {
    deleteCardMutation.mutate({ cardId, gameId }, {
      onSuccess: () => {
        toast({ title: "カードを削除しました" });
      },
    });
  };

  return (
    <div className="min-h-screen p-4 md:p-8 space-y-8 max-w-[1600px] mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button data-testid="button-back-type-select" variant="outline" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <Header size="sm" />
        </div>
        <div className="flex flex-col items-end gap-1">
          {!formData.name.trim() && !createCardMutation.isPending && (
            <p className="text-xs text-amber-400">カード名を入力してください</p>
          )}
          <Button
            data-testid="button-save-card"
            onClick={handleSave}
            disabled={createCardMutation.isPending || !formData.name.trim()}
            className="bg-green-600 text-white border-green-700"
          >
            <Save className="w-5 h-5" />
            {createCardMutation.isPending ? "保存中..." : "カードを保存"}
          </Button>
        </div>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-4">
          <div className="bg-card/50 backdrop-blur-xl border border-white/5 rounded-md p-4 shadow-xl">
            <Tabs defaultValue="content">
              <TabsList className="w-full">
                <TabsTrigger value="content" className="flex-1">カード設定</TabsTrigger>
                <TabsTrigger value="ai" className="flex-1">AI 分析</TabsTrigger>
              </TabsList>

              <TabsContent value="content" className="space-y-6 pt-2">
                <div>
                  <h2 className="text-xl font-['Orbitron'] mb-6 flex items-center gap-2">
                    <span className="w-1 h-6 bg-primary rounded-full"></span>
                    カード詳細
                  </h2>
                  <InputForm values={formData} onChange={setFormData} />
                </div>

                {existingCards && existingCards.length > 0 && (
                  <div>
                    <h2 className="text-lg font-['Orbitron'] mb-4 flex items-center gap-2">
                      <span className="w-1 h-5 bg-accent rounded-full"></span>
                      保存済みカード ({existingCards.length})
                    </h2>
                    <div className="space-y-2">
                      {existingCards.map((card) => {
                        const attrs = card.attributes as TCGAttributes | null;
                        return (
                          <div key={card.id} className="flex items-center justify-between gap-2 p-2 rounded-md bg-background/50">
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate">{card.name}</p>
                              {attrs && (
                                <p className="text-xs text-muted-foreground">
                                  ATK {attrs.attack} / HP {attrs.hp}
                                </p>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteCard(card.id)}
                              data-testid={`button-delete-card-${card.id}`}
                            >
                              <Trash2 className="w-3 h-3 text-destructive" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="ai">
                <AIPanel
                  onAnalyze={handleAnalyze}
                  onApply={handleApplySuggestion}
                  isAnalyzing={balanceCheckMutation.isPending}
                  suggestion={suggestion}
                  error={balanceCheckMutation.error?.message}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <div className="lg:col-span-8 flex flex-col items-center">
          <div className="sticky top-8 w-full">
            <div className="relative z-10">
              <CardPreview {...formData} isLoading={balanceCheckMutation.isPending} />
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/20 blur-[100px] rounded-full -z-10 pointer-events-none"></div>
          </div>
        </div>
      </main>

      <div className="flex flex-col items-end gap-1 mt-4">
        {!formData.name.trim() && !createCardMutation.isPending && (
          <p className="text-xs text-amber-400">カード名を入力してください</p>
        )}
        <Button
          data-testid="button-save-card-bottom"
          onClick={handleSave}
          disabled={createCardMutation.isPending || !formData.name.trim()}
          className="bg-green-600 text-white border-green-700"
        >
          <Save className="w-5 h-5" />
          {createCardMutation.isPending ? "保存中..." : "カードを保存"}
        </Button>
      </div>
    </div>
  );
}

interface PCGAttributes {
  type: string;
  action: string;
  effect: string;
  winCondition: string;
  playerCount: string;
  difficulty: string;
}

interface PCGHeaderSettings {
  backgroundColor: string;
  textColor: string;
  borderRadius: "none" | "small" | "medium" | "large";
}

interface PCGFooterSettings {
  backgroundColor: string;
  textColor: string;
  visible: boolean;
}

interface PCGDesignSettings {
  textSize: "xs" | "small" | "medium" | "large";
  backgroundColor: string;
  fontFamily: string;
  textColor: string;
  header?: PCGHeaderSettings;
  footer?: PCGFooterSettings;
}

const defaultHeaderSettings: PCGHeaderSettings = {
  backgroundColor: "",
  textColor: "",
  borderRadius: "none",
};

const defaultFooterSettings: PCGFooterSettings = {
  backgroundColor: "",
  textColor: "",
  visible: true,
};

const defaultDesign: PCGDesignSettings = {
  textSize: "medium",
  backgroundColor: "#1e3a5f",
  fontFamily: "gothic",
  textColor: "#ffffff",
  header: { ...defaultHeaderSettings },
  footer: { ...defaultFooterSettings },
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

const bgColorPresets = [
  { value: "#ffffff", label: "白" },
  { value: "#000000", label: "黒" },
  { value: "#1e3a5f", label: "紺" },
  { value: "#2563eb", label: "青" },
  { value: "#dc2626", label: "赤" },
  { value: "#16a34a", label: "緑" },
  { value: "#7c3aed", label: "紫" },
  { value: "#d97706", label: "琥珀" },
];

const textColorPresets = [
  { value: "#ffffff", label: "白" },
  { value: "#000000", label: "黒" },
  { value: "#fbbf24", label: "金" },
  { value: "#60a5fa", label: "水" },
  { value: "#f87171", label: "赤" },
];

const fontOptions = [
  { value: "gothic", label: "ゴシック体", family: "'Rajdhani', sans-serif" },
  { value: "mincho", label: "明朝体", family: "'Libre Baskerville', 'Playfair Display', serif" },
  { value: "rounded", label: "丸ゴシック", family: "'DM Sans', sans-serif" },
  { value: "handwriting", label: "手書き風", family: "'Architects Daughter', cursive" },
  { value: "cinzel", label: "クラシック", family: "'Cinzel', serif" },
  { value: "orbitron", label: "サイバー", family: "'Orbitron', sans-serif" },
];

const getTextSizes = (size: string) => {
  const sizeMap: Record<string, { title: string; body: string; label: string }> = {
    xs: { title: "14px", body: "10px", label: "8px" },
    small: { title: "16px", body: "12px", label: "9px" },
    medium: { title: "20px", body: "14px", label: "10px" },
    large: { title: "24px", body: "16px", label: "11px" },
  };
  return sizeMap[size] || sizeMap.medium;
};

const getResolvedFont = (family: string) => {
  const found = fontOptions.find(f => f.value === family);
  return found?.family || "'Rajdhani', sans-serif";
};

function PCGCardPreviewFull({
  name, action, effect, type, playerCount, difficulty, frontImageUrl, backImageUrl, side, design
}: PCGFormData & { frontImageUrl?: string; backImageUrl?: string; side: "front" | "back"; design: PCGDesignSettings }) {
  const fontFamily = getResolvedFont(design.fontFamily);
  const sizes = getTextSizes(design.textSize);
  const typeLabel = type === "action" ? "アクション" : type === "event" ? "イベント" : "ペナルティ";
  const bgColor = design.backgroundColor;
  const textCol = design.textColor;

  const headerBg = design.header?.backgroundColor || "";
  const headerText = design.header?.textColor || textCol;
  const headerRadius = getBorderRadius(design.header?.borderRadius || "none");
  const footerBg = design.footer?.backgroundColor || "";
  const footerText = design.footer?.textColor || textCol;
  const footerVisible = design.footer?.visible !== false;

  if (side === "back") {
    return (
      <div className="w-full max-w-sm mx-auto aspect-[2.5/3.5]">
        <div className="relative w-full h-full rounded-md border-4 shadow-2xl overflow-hidden" style={{ backgroundColor: bgColor }}>
          {backImageUrl ? (
            <img src={backImageUrl} alt="裏面" className="absolute inset-0 w-full h-full object-cover" />
          ) : null}
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6" style={{ color: textCol, fontFamily }}>
            <div className="w-20 h-20 rounded-md bg-white/10 flex items-center justify-center mb-4 backdrop-blur-sm border border-white/20">
              <PartyPopper className="w-10 h-10 opacity-60" />
            </div>
            <p className="font-bold opacity-80 tracking-wider" style={{ fontFamily: "'Orbitron', sans-serif", fontSize: sizes.title }}>
              PARTY CARD
            </p>
            <p className="opacity-40 mt-2 tracking-[0.3em] uppercase" style={{ fontFamily: "'Orbitron', sans-serif", fontSize: sizes.label }}>
              PAPER DREAM
            </p>
          </div>
          <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(255,255,255,0.02)_10px,rgba(255,255,255,0.02)_20px)]" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm mx-auto aspect-[2.5/3.5]">
      <div className="relative w-full h-full rounded-md border-4 shadow-2xl overflow-hidden" style={{ backgroundColor: bgColor, color: textCol, fontFamily }}>
        <div
          className="p-4 flex justify-between items-center border-b border-white/10 backdrop-blur-sm"
          style={{
            backgroundColor: headerBg || "rgba(0,0,0,0.2)",
            borderRadius: headerRadius,
          }}
        >
          <h3 className="font-bold truncate drop-shadow-md" style={{ fontFamily, color: headerText, fontSize: sizes.title }}>
            {name || "名称未設定"}
          </h3>
        </div>

        <div className="px-4 pt-3 flex items-center gap-2 flex-wrap">
          <span className="bg-white/20 px-2 py-1 rounded-md" style={{ color: textCol, fontSize: sizes.label }}>{typeLabel}</span>
          {playerCount && <span className="bg-white/10 opacity-80 px-2 py-1 rounded-md" style={{ fontSize: sizes.label }}>{playerCount}</span>}
          {difficulty && <span className="bg-white/10 opacity-80 px-2 py-1 rounded-md" style={{ fontSize: sizes.label }}>{difficulty === "easy" ? "かんたん" : difficulty === "normal" ? "ふつう" : "むずかしい"}</span>}
        </div>

        {frontImageUrl && (
          <div className="px-4 pt-3">
            <div className="w-full h-44 rounded-md overflow-hidden border border-white/10">
              <img src={frontImageUrl} alt={name} className="w-full h-full object-cover" />
            </div>
          </div>
        )}

        <div className={`absolute ${footerVisible ? "bottom-8" : "bottom-2"} left-4 right-4 ${frontImageUrl ? "top-[50%]" : "top-[35%]"} bg-black/40 rounded-md p-4 border border-white/10 backdrop-blur-md`}>
          <div className="h-full overflow-y-auto space-y-3">
            {action && (
              <div>
                <p className="opacity-50 uppercase font-['Orbitron'] mb-1" style={{ fontSize: sizes.label }}>アクション</p>
                <p className="leading-relaxed opacity-90" style={{ fontFamily, color: textCol, fontSize: sizes.body }}>{action}</p>
              </div>
            )}
            {effect && (
              <div>
                <p className="opacity-50 uppercase font-['Orbitron'] mb-1" style={{ fontSize: sizes.label }}>効果</p>
                <p className="leading-relaxed opacity-90" style={{ fontFamily, color: textCol, fontSize: sizes.body }}>{effect}</p>
              </div>
            )}
          </div>
        </div>

        {footerVisible && (
          <div
            className="absolute bottom-0 w-full p-2 text-center text-[10px] font-['Orbitron'] uppercase tracking-[0.2em]"
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

function EditableCardPreview({
  formData,
  updateField,
  frontImageUrl,
  backImageUrl,
  side,
  design,
  onImageClick,
}: {
  formData: PCGFormData;
  updateField: (field: string, value: string) => void;
  frontImageUrl: string;
  backImageUrl: string;
  side: "front" | "back";
  design: PCGDesignSettings;
  onImageClick: () => void;
}) {
  const [editingField, setEditingField] = useState<string | null>(null);
  const fontFamily = getResolvedFont(design.fontFamily);
  const sizes = getTextSizes(design.textSize);
  const bgColor = design.backgroundColor;
  const textCol = design.textColor;
  const typeLabel = formData.type === "action" ? "アクション" : formData.type === "event" ? "イベント" : "ペナルティ";

  const headerBg = design.header?.backgroundColor || "";
  const headerText = design.header?.textColor || textCol;
  const headerRadius = getBorderRadius(design.header?.borderRadius || "none");
  const footerBg = design.footer?.backgroundColor || "";
  const footerText = design.footer?.textColor || textCol;
  const footerVisible = design.footer?.visible !== false;

  if (side === "back") {
    return (
      <div className="w-full aspect-[2.5/3.5]" data-testid="editable-card-preview-back">
        <div className="relative w-full h-full rounded-md border-4 shadow-2xl overflow-hidden cursor-pointer" style={{ backgroundColor: bgColor }} onClick={onImageClick}>
          {backImageUrl ? (
            <img src={backImageUrl} alt="裏面" className="absolute inset-0 w-full h-full object-cover" />
          ) : null}
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6" style={{ color: textCol, fontFamily }}>
            <div className="w-20 h-20 rounded-md bg-white/10 flex items-center justify-center mb-4 backdrop-blur-sm border border-white/20">
              <PartyPopper className="w-10 h-10 opacity-60" />
            </div>
            <p className="font-bold opacity-80 tracking-wider" style={{ fontFamily: "'Orbitron', sans-serif", fontSize: sizes.title }}>
              PARTY CARD
            </p>
            <p className="opacity-40 mt-2 tracking-[0.3em] uppercase" style={{ fontFamily: "'Orbitron', sans-serif", fontSize: sizes.label }}>
              クリックして裏面画像を選択
            </p>
          </div>
          <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(255,255,255,0.02)_10px,rgba(255,255,255,0.02)_20px)] pointer-events-none" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full aspect-[2.5/3.5]" data-testid="editable-card-preview-front">
      <div className="relative w-full h-full rounded-md border-4 shadow-2xl overflow-hidden flex flex-col" style={{ backgroundColor: bgColor, color: textCol, fontFamily }}>
        <div
          className="p-4 flex justify-between items-center border-b border-white/10 backdrop-blur-sm shrink-0"
          style={{
            backgroundColor: headerBg || "rgba(0,0,0,0.2)",
            borderRadius: headerRadius,
          }}
        >
          {editingField === "name" ? (
            <input
              type="text"
              value={formData.name}
              onChange={(e) => updateField("name", e.target.value)}
              onBlur={() => setEditingField(null)}
              onKeyDown={(e) => e.key === "Enter" && setEditingField(null)}
              autoFocus
              className="w-full font-bold bg-transparent border-b-2 border-white/40 outline-none"
              style={{ fontSize: sizes.title, color: headerText, fontFamily }}
              data-testid="inline-edit-name"
            />
          ) : (
            <h3
              onClick={() => setEditingField("name")}
              className="font-bold truncate drop-shadow-md cursor-text w-full"
              style={{ fontFamily, color: headerText, fontSize: sizes.title }}
              title="クリックして編集"
              data-testid="preview-card-name"
            >
              {formData.name || "クリックしてカード名を編集"}
            </h3>
          )}
        </div>

        <div className="px-4 pt-3 flex items-center gap-2 flex-wrap shrink-0">
          <span className="bg-white/20 px-2 py-1 rounded-md" style={{ color: textCol, fontSize: sizes.label }}>{typeLabel}</span>
          {formData.playerCount && <span className="bg-white/10 opacity-80 px-2 py-1 rounded-md" style={{ fontSize: sizes.label }}>{formData.playerCount}</span>}
          {formData.difficulty && <span className="bg-white/10 opacity-80 px-2 py-1 rounded-md" style={{ fontSize: sizes.label }}>{formData.difficulty === "easy" ? "かんたん" : formData.difficulty === "normal" ? "ふつう" : "むずかしい"}</span>}
        </div>

        <div
          className="mx-4 mt-3 rounded-md overflow-hidden border border-white/10 cursor-pointer shrink-0 h-44"
          onClick={onImageClick}
          data-testid="preview-image-area"
        >
          {frontImageUrl ? (
            <img src={frontImageUrl} alt={formData.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-white/10 text-white/50 gap-2">
              <ImagePlus className="w-4 h-4" />
              <span style={{ fontSize: sizes.body }}>クリックして画像を選択</span>
            </div>
          )}
        </div>

        <div className={`flex-1 mx-4 mt-3 ${footerVisible ? "mb-8" : "mb-2"} bg-black/40 rounded-md p-4 border border-white/10 backdrop-blur-md overflow-hidden`}>
          <div className="h-full overflow-y-auto space-y-3">
            <div>
              <p className="opacity-50 uppercase font-['Orbitron'] mb-1" style={{ fontSize: sizes.label }}>アクション</p>
              {editingField === "action" ? (
                <textarea
                  value={formData.action}
                  onChange={(e) => updateField("action", e.target.value)}
                  onBlur={() => setEditingField(null)}
                  autoFocus
                  className="w-full bg-transparent border border-white/30 rounded-md p-1 outline-none resize-none"
                  style={{ color: textCol, fontFamily, fontSize: sizes.body }}
                  rows={2}
                  data-testid="inline-edit-action"
                />
              ) : (
                <p
                  onClick={() => setEditingField("action")}
                  className="leading-relaxed opacity-90 cursor-text min-h-[1.5em]"
                  style={{ fontFamily, color: textCol, fontSize: sizes.body }}
                  title="クリックして編集"
                  data-testid="preview-card-action"
                >
                  {formData.action || "クリックしてアクションを編集"}
                </p>
              )}
            </div>
            <div>
              <p className="opacity-50 uppercase font-['Orbitron'] mb-1" style={{ fontSize: sizes.label }}>効果</p>
              {editingField === "effect" ? (
                <textarea
                  value={formData.effect}
                  onChange={(e) => updateField("effect", e.target.value)}
                  onBlur={() => setEditingField(null)}
                  autoFocus
                  className="w-full bg-transparent border border-white/30 rounded-md p-1 outline-none resize-none"
                  style={{ color: textCol, fontFamily, fontSize: sizes.body }}
                  rows={2}
                  data-testid="inline-edit-effect"
                />
              ) : (
                <p
                  onClick={() => setEditingField("effect")}
                  className="leading-relaxed opacity-90 cursor-text min-h-[1.5em]"
                  style={{ fontFamily, color: textCol, fontSize: sizes.body }}
                  title="クリックして編集"
                  data-testid="preview-card-effect"
                >
                  {formData.effect || "クリックして効果を編集"}
                </p>
              )}
            </div>
          </div>
        </div>

        {footerVisible && (
          <div
            className="absolute bottom-0 w-full p-2 text-center text-[10px] font-['Orbitron'] uppercase tracking-[0.2em]"
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

function PCGGameCreateForm({ onSubmit, onCancel }: {
  onSubmit: (title: string, description: string) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duplicateDialog, setDuplicateDialog] = useState<{ open: boolean; existingGameId: number | null }>({ open: false, existingGameId: null });
  const { data: games } = useGames();
  const [, setLocation] = useLocation();

  const trimmedTitle = title.trim();
  const existingGame = trimmedTitle ? games?.find(g => g.title === trimmedTitle) : null;

  const handleSubmit = () => {
    if (!trimmedTitle) return;
    if (existingGame) {
      setDuplicateDialog({ open: true, existingGameId: existingGame.id });
      return;
    }
    onSubmit(trimmedTitle, description);
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-6 relative overflow-x-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/10 via-background to-background" />
      </div>

      <div className="relative z-10 max-w-lg w-full pt-16 pb-12 space-y-8">
        <div className="flex items-center gap-4">
          <Button data-testid="button-pcg-create-back" variant="outline" size="icon" onClick={onCancel}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <Header size="sm" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <UICard className="overflow-visible">
            <CardContent className="p-8 space-y-6">
              <div className="text-center space-y-2">
                <div className="w-14 h-14 rounded-md bg-gradient-to-br from-amber-500 to-orange-700 flex items-center justify-center shadow-lg mx-auto">
                  <PartyPopper className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-xl font-bold" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                  新しいパーティカードゲームを作成
                </h2>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-['Orbitron'] tracking-wider text-muted-foreground">
                  ゲーム名
                </label>
                <input
                  data-testid="input-pcg-game-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="例: UNOっぽいゲーム"
                  className="w-full bg-black/20 border-2 border-border/50 rounded-md px-4 py-3 text-lg font-bold focus:border-amber-500 focus:outline-none focus:ring-4 focus:ring-amber-500/10 transition-all placeholder:text-muted-foreground/50"
                />
                {title.length > 0 && !trimmedTitle && (
                  <p className="text-xs text-destructive" style={{ fontFamily: "'Rajdhani', sans-serif" }}>ゲーム名を入力してください</p>
                )}
                {existingGame && (
                  <p className="text-xs text-amber-400" style={{ fontFamily: "'Rajdhani', sans-serif" }}>同名のゲームがあります</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-['Orbitron'] tracking-wider text-muted-foreground">
                  ゲーム説明
                </label>
                <textarea
                  data-testid="input-pcg-game-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="例: 手札を早く無くした人が勝ち"
                  rows={3}
                  className="w-full bg-black/20 border-2 border-border/50 rounded-md px-4 py-3 text-base resize-none focus:border-amber-500 focus:outline-none focus:ring-4 focus:ring-amber-500/10 transition-all placeholder:text-muted-foreground/50"
                />
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <Button variant="outline" onClick={onCancel} data-testid="button-pcg-create-cancel">
                  キャンセル
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!trimmedTitle}
                  className="bg-amber-600 text-white border-amber-700"
                  data-testid="button-pcg-create-submit"
                >
                  ゲームを作成
                </Button>
              </div>
            </CardContent>
          </UICard>
        </motion.div>
      </div>

      <Dialog open={duplicateDialog.open} onOpenChange={(open) => setDuplicateDialog(d => ({ ...d, open }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle style={{ fontFamily: "'Orbitron', sans-serif" }}>同名のゲームがあります</DialogTitle>
            <DialogDescription style={{ fontFamily: "'Rajdhani', sans-serif" }} className="text-base pt-1">
              「{trimmedTitle}」はすでに存在します。どうしますか？
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col gap-2 sm:flex-col">
            <Button
              className="w-full"
              onClick={() => setLocation(`/create/${duplicateDialog.existingGameId}`)}
            >
              既存を開く
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setTitle(trimmedTitle + " (2)");
                setDuplicateDialog({ open: false, existingGameId: null });
              }}
            >
              別名で作る（「{trimmedTitle} (2)」を提案）
            </Button>
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => setDuplicateDialog({ open: false, existingGameId: null })}
            >
              キャンセル
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PCGCardManager({ gameId, onBack }: { gameId: number; onBack: () => void }) {
  const { toast } = useToast();
  const { data: game } = useGame(gameId);
  const { data: existingCards, isLoading: cardsLoading } = useGameCards(gameId);
  const deleteCardMutation = useDeleteCard();
  const [, setLocation] = useLocation();
  const [editingCardId, setEditingCardId] = useState<number | null>(null);

  const handleDeleteCard = (cardId: number) => {
    deleteCardMutation.mutate({ cardId, gameId }, {
      onSuccess: () => {
        toast({ title: "カードを削除しました" });
      },
    });
  };

  if (editingCardId !== null) {
    const card = existingCards?.find(c => c.id === editingCardId);
    return (
      <PCGCardEditor
        gameId={gameId}
        editCard={card || null}
        onBack={() => setEditingCardId(null)}
      />
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 space-y-8 max-w-[1200px] mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button data-testid="button-back-type-select" variant="outline" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <Header size="sm" />
        </div>
        <Button
          variant="outline"
          onClick={() => setLocation("/preview")}
          data-testid="button-goto-preview"
        >
          <Printer className="w-4 h-4" />
          印刷プレビューへ
        </Button>
      </header>

      {game && (
        <div className="bg-card/50 backdrop-blur-xl border border-white/5 rounded-md p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-md bg-gradient-to-br from-amber-500 to-orange-700 flex items-center justify-center shadow-sm">
              <PartyPopper className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-xl font-bold" style={{ fontFamily: "'Orbitron', sans-serif" }}>
              {game.title}
            </h2>
          </div>
          {game.description && (
            <p className="text-sm text-muted-foreground ml-11">
              {game.description.replace(/^\[PCG\]\s*/, "")}
            </p>
          )}
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
          <h3 className="text-lg font-bold flex items-center gap-2" style={{ fontFamily: "'Orbitron', sans-serif" }}>
            <span className="w-1 h-5 bg-amber-500 rounded-full"></span>
            作成済みカード一覧 ({existingCards?.length || 0}枚)
          </h3>
          <Button
            onClick={() => setEditingCardId(-1)}
            className="bg-amber-600 text-white border-amber-700"
            data-testid="button-add-new-card"
          >
            <Plus className="w-4 h-4" />
            新規カード
          </Button>
        </div>

        {cardsLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-10 h-10 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
          </div>
        ) : existingCards && existingCards.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {existingCards.map((card) => {
              const attrs = card.attributes as PCGAttributes | null;
              const typeLabel = attrs?.type === "action" ? "アクション" : attrs?.type === "event" ? "イベント" : "ペナルティ";
              const typeColor = attrs?.type === "action" ? "border-blue-500" : attrs?.type === "event" ? "border-amber-500" : "border-red-500";
              const thumbUrl = card.frontImageUrl || card.imageUrl;

              return (
                <div
                  key={card.id}
                  className={`rounded-md border-2 ${typeColor} overflow-hidden hover-elevate active-elevate-2 cursor-pointer`}
                  data-testid={`card-item-${card.id}`}
                  onClick={() => setEditingCardId(card.id)}
                >
                  <div className="aspect-[63/88] bg-muted/50 overflow-hidden">
                    {thumbUrl ? (
                      <img
                        src={thumbUrl}
                        alt={card.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/40 p-2">
                        <PartyPopper className="w-8 h-8 mb-1" />
                        <span className="text-[10px]">No Image</span>
                      </div>
                    )}
                  </div>
                  <div className="p-2 space-y-2">
                    <p className="text-sm font-semibold text-center truncate">{card.name}</p>
                    <span className="block text-[10px] text-muted-foreground text-center">{typeLabel}</span>
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-xs"
                        onClick={(e) => { e.stopPropagation(); setEditingCardId(card.id); }}
                        data-testid={`button-edit-card-${card.id}`}
                      >
                        <Pencil className="w-3 h-3" />
                        編集
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="shrink-0"
                        onClick={(e) => { e.stopPropagation(); handleDeleteCard(card.id); }}
                        data-testid={`button-delete-card-${card.id}`}
                      >
                        <Trash2 className="w-3 h-3 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 text-muted-foreground">
            <PartyPopper className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg mb-2">まだカードがありません</p>
            <p className="text-sm">「新規カード」ボタンでカードを追加しましょう</p>
          </div>
        )}
      </div>
    </div>
  );
}

function PCGCardEditor({ gameId, editCard, onBack }: {
  gameId: number;
  editCard: Card | null;
  onBack: () => void;
}) {
  const { toast } = useToast();
  const createCardMutation = useCreateCard();
  const updateCardMutation = useUpdateCard();
  const uploadImageMutation = useUploadImage();
  const frontFileInputRef = useRef<HTMLInputElement>(null);
  const backFileInputRef = useRef<HTMLInputElement>(null);

  const isEditing = editCard !== null && editCard.id > 0;
  const existingAttrs = editCard?.attributes as (PCGAttributes & { layout?: PCGDesignSettings }) | null;

  const [formData, setFormData] = useState<PCGFormData>({
    name: existingAttrs ? editCard!.name : "",
    action: existingAttrs?.action || "",
    winCondition: existingAttrs?.winCondition || "",
    playerCount: existingAttrs?.playerCount || "3〜6人",
    difficulty: existingAttrs?.difficulty || "normal",
    type: existingAttrs?.type || "action",
    effect: existingAttrs?.effect || "",
  });

  const [frontImageUrl, setFrontImageUrl] = useState(editCard?.frontImageUrl || editCard?.imageUrl || "");
  const [backImageUrl, setBackImageUrl] = useState(editCard?.backImageUrl || "");
  const [previewSide, setPreviewSide] = useState<"front" | "back">("front");
  const [design, setDesign] = useState<PCGDesignSettings>(
    existingAttrs?.layout || defaultDesign
  );

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (side: "front" | "back") => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    uploadImageMutation.mutate(file, {
      onSuccess: (data) => {
        if (side === "front") {
          setFrontImageUrl(data.url);
        } else {
          setBackImageUrl(data.url);
        }
        toast({ title: `${side === "front" ? "表面" : "裏面"}画像をアップロードしました` });
      },
      onError: (error) => {
        toast({ variant: "destructive", title: "アップロードに失敗しました", description: error.message });
      },
    });
  };

  const handleSave = () => {
    const attributes = {
      type: formData.type,
      action: formData.action,
      effect: formData.effect,
      winCondition: formData.winCondition,
      playerCount: formData.playerCount,
      difficulty: formData.difficulty,
      layout: design,
    };

    if (isEditing) {
      updateCardMutation.mutate({
        cardId: editCard!.id,
        gameId,
        name: formData.name,
        frontImageUrl,
        backImageUrl,
        attributes: attributes as unknown as Record<string, unknown>,
      }, {
        onSuccess: () => {
          toast({
            title: "カードを更新しました",
            description: `「${formData.name}」を更新しました。`,
            className: "bg-green-600 border-green-700 text-white",
          });
          onBack();
        },
        onError: (error) => {
          toast({ variant: "destructive", title: "更新に失敗しました", description: error.message });
        }
      });
    } else {
      createCardMutation.mutate({
        gameId,
        name: formData.name,
        frontImageUrl,
        backImageUrl,
        attributes: attributes as unknown as Record<string, unknown>,
      }, {
        onSuccess: () => {
          toast({
            title: "カードを保存しました",
            description: `「${formData.name}」がゲームに追加されました。`,
            className: "bg-green-600 border-green-700 text-white",
          });
          onBack();
        },
        onError: (error) => {
          toast({ variant: "destructive", title: "保存に失敗しました", description: error.message });
        }
      });
    }
  };

  const isPending = createCardMutation.isPending || updateCardMutation.isPending;
  const currentFileRef = previewSide === "front" ? frontFileInputRef : backFileInputRef;

  const handlePreviewImageClick = () => {
    currentFileRef.current?.click();
  };

  return (
    <div className="min-h-screen p-4 md:p-8 space-y-6 max-w-[1400px] mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button data-testid="button-card-editor-back" variant="outline" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <Header size="sm" />
        </div>
        <div className="flex gap-3 flex-wrap items-start">
          <Button variant="outline" onClick={onBack} data-testid="button-card-editor-cancel">
            キャンセル
          </Button>
          <div className="flex flex-col items-end gap-1">
            {!formData.name.trim() && !isPending && (
              <p className="text-xs text-amber-400">カード名を入力してください</p>
            )}
            <Button
              data-testid="button-save-card"
              onClick={handleSave}
              disabled={isPending || !formData.name.trim()}
              className="bg-green-600 text-white border-green-700"
            >
              <Save className="w-5 h-5" />
              {isPending ? "保存中..." : "保存して戻る"}
            </Button>
          </div>
        </div>
      </header>

      <input
        ref={frontFileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload("front")}
        className="hidden"
        data-testid="input-front-image-file"
      />
      <input
        ref={backFileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload("back")}
        className="hidden"
        data-testid="input-back-image-file"
      />

      <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-card/50 backdrop-blur-xl border border-white/5 rounded-md p-4 shadow-xl">
            <Tabs defaultValue="content">
              <TabsList className="w-full">
                <TabsTrigger value="content" className="flex-1">コンテンツ</TabsTrigger>
                <TabsTrigger value="design" className="flex-1">デザイン</TabsTrigger>
              </TabsList>

              <TabsContent value="content" className="space-y-4 pt-2">
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground flex items-center gap-2">
                    カード名 <span className="text-red-400 text-xs">* 必須</span>
                  </label>
                  <input
                    data-testid="input-pcg-card-name"
                    value={formData.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    placeholder="カード名を入力..."
                    className="w-full bg-black/20 border border-border/50 rounded-md px-3 py-2 text-sm focus:border-amber-500/70 focus:outline-none transition-all placeholder:text-muted-foreground/50"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground flex items-center gap-2">カードタイプ</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["action", "event", "penalty"] as const).map((type) => (
                      <Button
                        key={type}
                        data-testid={`button-pcg-type-${type}`}
                        variant="outline"
                        size="sm"
                        onClick={() => updateField("type", type)}
                        className={`toggle-elevate ${formData.type === type ? "toggle-elevated" : ""} text-xs`}
                      >
                        {type === "action" ? "アクション" : type === "event" ? "イベント" : "ペナルティ"}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">アクション</label>
                  <textarea
                    value={formData.action}
                    onChange={(e) => updateField("action", e.target.value)}
                    placeholder="アクション内容を入力..."
                    rows={3}
                    className="w-full bg-black/20 border border-border/50 rounded-md px-3 py-2 text-sm focus:border-amber-500/70 focus:outline-none transition-all placeholder:text-muted-foreground/50 resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">効果テキスト</label>
                  <textarea
                    value={formData.effect}
                    onChange={(e) => updateField("effect", e.target.value)}
                    placeholder="効果テキストを入力..."
                    rows={3}
                    className="w-full bg-black/20 border border-border/50 rounded-md px-3 py-2 text-sm focus:border-amber-500/70 focus:outline-none transition-all placeholder:text-muted-foreground/50 resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground flex items-center gap-2">プレイ人数</label>
                  <input
                    data-testid="input-pcg-player-count"
                    value={formData.playerCount}
                    onChange={(e) => updateField("playerCount", e.target.value)}
                    placeholder="例: 2〜6人"
                    className="w-full bg-black/20 border border-border/50 rounded-md px-3 py-2 text-sm focus:border-primary focus:outline-none transition-all placeholder:text-muted-foreground/50"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground flex items-center gap-2">難易度</label>
                  <div className="grid grid-cols-3 gap-1">
                    {(["easy", "normal", "hard"] as const).map((diff) => (
                      <Button
                        key={diff}
                        data-testid={`button-pcg-difficulty-${diff}`}
                        variant="outline"
                        size="sm"
                        onClick={() => updateField("difficulty", diff)}
                        className={`toggle-elevate ${formData.difficulty === diff ? "toggle-elevated" : ""} text-xs`}
                      >
                        {diff === "easy" ? "かんたん" : diff === "normal" ? "ふつう" : "むずかしい"}
                      </Button>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="design" className="space-y-6 pt-2">

                <div className="space-y-4">
                  <h3 className="text-sm font-['Orbitron'] flex items-center gap-2">
                    <span className="w-1 h-4 bg-amber-500 rounded-full"></span>
                    {previewSide === "front" ? "表面" : "裏面"}画像
                  </h3>

                  <div className="flex flex-col items-center">
              <div
                className="aspect-[63/88] bg-muted/30 rounded-md overflow-hidden border-2 border-dashed border-border/50 cursor-pointer"
                style={{ width: "160px" }}
                onClick={handlePreviewImageClick}
                data-testid={`image-thumbnail-${previewSide}`}
              >
                {(previewSide === "front" ? frontImageUrl : backImageUrl) ? (
                  <img
                    src={previewSide === "front" ? frontImageUrl : backImageUrl}
                    alt={`${previewSide === "front" ? "表面" : "裏面"}画像`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/40">
                    <ImagePlus className="w-8 h-8 mb-1" />
                    <span className="text-xs">画像なし</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2 mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreviewImageClick}
                  disabled={uploadImageMutation.isPending}
                  data-testid={`button-upload-${previewSide}-image`}
                >
                  <ImagePlus className="w-3 h-3" />
                  {uploadImageMutation.isPending ? "..." : "画像を変更"}
                </Button>
                {(previewSide === "front" ? frontImageUrl : backImageUrl) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => previewSide === "front" ? setFrontImageUrl("") : setBackImageUrl("")}
                    data-testid={`button-remove-${previewSide}-image`}
                  >
                    <Trash2 className="w-3 h-3" />
                    削除
                  </Button>
                )}
              </div>
            </div>
                </div>

                <div className="border-t border-border/30 pt-4 space-y-4">
                  <h3 className="text-sm font-['Orbitron'] flex items-center gap-2">
                    <span className="w-1 h-4 bg-amber-500 rounded-full"></span>
                    レイアウト調整
                  </h3>

                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">テキストサイズ</label>
              <div className="flex gap-2">
                {(["xs", "small", "medium", "large"] as const).map((size) => (
                  <Button
                    key={size}
                    variant="outline"
                    size="sm"
                    onClick={() => setDesign(prev => ({ ...prev, textSize: size }))}
                    className={`toggle-elevate ${design.textSize === size ? "toggle-elevated" : ""} flex-1`}
                    data-testid={`button-text-size-${size}`}
                  >
                    {size === "xs" ? "極小" : size === "small" ? "小" : size === "medium" ? "中" : "大"}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">背景色</label>
              <input
                type="color"
                value={design.backgroundColor}
                onChange={(e) => setDesign(prev => ({ ...prev, backgroundColor: e.target.value }))}
                className="w-full h-8 rounded-md cursor-pointer border border-border/50 bg-transparent"
                data-testid="input-bg-color-picker"
              />
              <div className="flex gap-1.5 flex-wrap">
                {bgColorPresets.map((preset) => (
                  <button
                    key={preset.value}
                    onClick={() => setDesign(prev => ({ ...prev, backgroundColor: preset.value }))}
                    className={`w-7 h-7 rounded-md border-2 transition-all ${
                      design.backgroundColor === preset.value ? "border-primary scale-110" : "border-border/50"
                    }`}
                    style={{ backgroundColor: preset.value }}
                    title={preset.label}
                    data-testid={`button-bg-preset-${preset.label}`}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">フォント</label>
              <select
                value={design.fontFamily}
                onChange={(e) => setDesign(prev => ({ ...prev, fontFamily: e.target.value }))}
                className="w-full bg-background border border-border/50 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                data-testid="select-font-family"
              >
                {fontOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">テキスト色</label>
              <input
                type="color"
                value={design.textColor}
                onChange={(e) => setDesign(prev => ({ ...prev, textColor: e.target.value }))}
                className="w-full h-8 rounded-md cursor-pointer border border-border/50 bg-transparent"
                data-testid="input-text-color-picker"
              />
              <div className="flex gap-1.5 flex-wrap">
                {textColorPresets.map((preset) => (
                  <button
                    key={preset.value}
                    onClick={() => setDesign(prev => ({ ...prev, textColor: preset.value }))}
                    className={`w-7 h-7 rounded-md border-2 transition-all ${
                      design.textColor === preset.value ? "border-primary scale-110" : "border-border/50"
                    }`}
                    style={{ backgroundColor: preset.value }}
                    title={preset.label}
                    data-testid={`button-text-preset-${preset.label}`}
                  />
                ))}
              </div>
            </div>

            <div className="border-t border-border/30 pt-4 space-y-2">
              <label className="text-sm text-muted-foreground font-semibold">ヘッダーエリア（カード名）</label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <label className="text-xs text-muted-foreground/70 w-12 shrink-0">背景</label>
                  <input
                    type="color"
                    value={design.header?.backgroundColor || design.backgroundColor}
                    onChange={(e) => setDesign(prev => ({ ...prev, header: { ...(prev.header || defaultHeaderSettings), backgroundColor: e.target.value } }))}
                    className="flex-1 h-7 rounded-md cursor-pointer border border-border/50 bg-transparent"
                    data-testid="input-header-bg-color"
                  />
                  {design.header?.backgroundColor && (
                    <button
                      onClick={() => setDesign(prev => ({ ...prev, header: { ...(prev.header || defaultHeaderSettings), backgroundColor: "" } }))}
                      className="text-xs text-muted-foreground/50"
                      data-testid="button-header-bg-reset"
                    >
                      reset
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-muted-foreground/70 w-12 shrink-0">文字</label>
                  <input
                    type="color"
                    value={design.header?.textColor || design.textColor}
                    onChange={(e) => setDesign(prev => ({ ...prev, header: { ...(prev.header || defaultHeaderSettings), textColor: e.target.value } }))}
                    className="flex-1 h-7 rounded-md cursor-pointer border border-border/50 bg-transparent"
                    data-testid="input-header-text-color"
                  />
                  {design.header?.textColor && (
                    <button
                      onClick={() => setDesign(prev => ({ ...prev, header: { ...(prev.header || defaultHeaderSettings), textColor: "" } }))}
                      className="text-xs text-muted-foreground/50"
                      data-testid="button-header-text-reset"
                    >
                      reset
                    </button>
                  )}
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground/70">角丸</label>
                  <div className="flex gap-1">
                    {(["none", "small", "medium", "large"] as const).map((r) => (
                      <Button
                        key={r}
                        variant="outline"
                        size="sm"
                        onClick={() => setDesign(prev => ({ ...prev, header: { ...(prev.header || defaultHeaderSettings), borderRadius: r } }))}
                        className={`toggle-elevate ${(design.header?.borderRadius || "none") === r ? "toggle-elevated" : ""} flex-1 text-xs`}
                        data-testid={`button-header-radius-${r}`}
                      >
                        {r === "none" ? "なし" : r === "small" ? "小" : r === "medium" ? "中" : "大"}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-border/30 pt-4 space-y-2">
              <label className="text-sm text-muted-foreground font-semibold">フッターエリア（PARTY CARD）</label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={design.footer?.visible !== false}
                    onChange={(e) => setDesign(prev => ({ ...prev, footer: { ...(prev.footer || defaultFooterSettings), visible: e.target.checked } }))}
                    className="w-4 h-4 rounded"
                    data-testid="input-footer-visible"
                  />
                  <label className="text-xs text-muted-foreground/70">表示する</label>
                </div>
                {design.footer?.visible !== false && (
                  <>
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-muted-foreground/70 w-12 shrink-0">背景</label>
                      <input
                        type="color"
                        value={design.footer?.backgroundColor || "#000000"}
                        onChange={(e) => setDesign(prev => ({ ...prev, footer: { ...(prev.footer || defaultFooterSettings), backgroundColor: e.target.value } }))}
                        className="flex-1 h-7 rounded-md cursor-pointer border border-border/50 bg-transparent"
                        data-testid="input-footer-bg-color"
                      />
                      {design.footer?.backgroundColor && (
                        <button
                          onClick={() => setDesign(prev => ({ ...prev, footer: { ...(prev.footer || defaultFooterSettings), backgroundColor: "" } }))}
                          className="text-xs text-muted-foreground/50"
                          data-testid="button-footer-bg-reset"
                        >
                          reset
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-muted-foreground/70 w-12 shrink-0">文字</label>
                      <input
                        type="color"
                        value={design.footer?.textColor || design.textColor}
                        onChange={(e) => setDesign(prev => ({ ...prev, footer: { ...(prev.footer || defaultFooterSettings), textColor: e.target.value } }))}
                        className="flex-1 h-7 rounded-md cursor-pointer border border-border/50 bg-transparent"
                        data-testid="input-footer-text-color"
                      />
                      {design.footer?.textColor && (
                        <button
                          onClick={() => setDesign(prev => ({ ...prev, footer: { ...(prev.footer || defaultFooterSettings), textColor: "" } }))}
                          className="text-xs text-muted-foreground/50"
                          data-testid="button-footer-text-reset"
                        >
                          reset
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDesign(defaultDesign)}
                    className="w-full"
                    data-testid="button-reset-design"
                  >
                    <RotateCcw className="w-3 h-3" />
                    デフォルトに戻す
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div className="flex flex-col gap-3">
            {!formData.name.trim() && !isPending && (
              <p className="text-xs text-amber-400 text-center">カード名を入力してください</p>
            )}
            <Button
              data-testid="button-save-card-bottom"
              onClick={handleSave}
              disabled={isPending || !formData.name.trim()}
              className="w-full bg-green-600 text-white border-green-700"
            >
              <Save className="w-5 h-5" />
              {isPending ? "保存中..." : "保存して戻る"}
            </Button>
            <Button variant="outline" onClick={onBack} className="w-full" data-testid="button-card-editor-cancel-bottom">
              キャンセル
            </Button>
          </div>
        </div>

        <div className="lg:col-span-8">
          <div className="bg-card/50 backdrop-blur-xl border border-white/5 rounded-md p-6 shadow-xl sticky top-8">
            <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
              <h2 className="text-xl font-['Orbitron'] flex items-center gap-2">
                <span className="w-1 h-6 bg-amber-500 rounded-full"></span>
                カードプレビュー
                <span className="text-xs text-muted-foreground font-sans ml-2">(クリックして直接編集)</span>
              </h2>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPreviewSide("front")}
                  className={`toggle-elevate ${previewSide === "front" ? "toggle-elevated" : ""}`}
                  data-testid="button-preview-front"
                >
                  表面
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPreviewSide("back")}
                  className={`toggle-elevate ${previewSide === "back" ? "toggle-elevated" : ""}`}
                  data-testid="button-preview-back"
                >
                  裏面
                </Button>
              </div>
            </div>

            <div className="relative w-full">
              <EditableCardPreview
                formData={formData}
                updateField={updateField}
                frontImageUrl={frontImageUrl}
                backImageUrl={backImageUrl}
                side={previewSide}
                design={design}
                onImageClick={handlePreviewImageClick}
              />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-amber-500/15 blur-[80px] rounded-full -z-10 pointer-events-none"></div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function Creator() {
  const params = useParams<{ id?: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const createGameMutation = useCreateGame();
  const { data: allGames } = useGames();

  const existingGameId = params.id ? parseInt(params.id) : null;
  const { data: existingGame, isLoading: gameLoading } = useGame(existingGameId);

  const [gameType, setGameType] = useState<GameType>(null);
  const [activeGameId, setActiveGameId] = useState<number | null>(null);
  const [pcgStep, setPcgStep] = useState<"create" | "manage">("create");
  const [tcgDuplicateDialog, setTcgDuplicateDialog] = useState<{ open: boolean; existingGameId: number | null }>({ open: false, existingGameId: null });

  const resolvedGameId = activeGameId ?? existingGameId;

  const resolvedType: GameType = gameType
    ?? (existingGame?.description?.startsWith("[PCG]") ? "pcg" : null)
    ?? (existingGame ? "tcg" : null);

  const handleSelectType = (type: "tcg" | "pcg") => {
    setGameType(type);
    if (type === "pcg") {
      setPcgStep("create");
    } else {
      const title = "新しいTCGゲーム";
      const existing = allGames?.find(g => g.title === title);
      if (existing) {
        setGameType(null);
        setTcgDuplicateDialog({ open: true, existingGameId: existing.id });
        return;
      }
      createGameMutation.mutate({ title, description: "トレーディングカードゲーム" }, {
        onSuccess: (game) => {
          setActiveGameId(game.id);
          setLocation(`/create/${game.id}`);
          toast({ title: "ゲームを作成しました", description: `「${game.title}」が作成されました。` });
        },
        onError: (error) => {
          if (error instanceof DuplicateTitleError) {
            setTcgDuplicateDialog({ open: true, existingGameId: error.existingGameId });
          } else {
            toast({ variant: "destructive", title: "ゲーム作成に失敗しました", description: error.message });
          }
          setGameType(null);
        }
      });
    }
  };

  const handlePCGCreateGame = (title: string, description: string) => {
    const fullDescription = description
      ? `[PCG] ${description}`
      : "[PCG] パーティカードゲーム";
    createGameMutation.mutate({
      title,
      description: fullDescription,
    }, {
      onSuccess: (game) => {
        setActiveGameId(game.id);
        setLocation(`/create/${game.id}`);
        setPcgStep("manage");
        toast({ title: "ゲームを作成しました", description: `「${game.title}」が作成されました。` });
      },
      onError: (error) => {
        if (error instanceof DuplicateTitleError) {
          toast({ variant: "destructive", title: "同名のゲームが存在します", description: "別のゲーム名を入力してください。" });
        } else {
          toast({ variant: "destructive", title: "ゲーム作成に失敗しました", description: error.message });
        }
      }
    });
  };

  const handleBack = () => {
    setGameType(null);
    setActiveGameId(null);
    setPcgStep("create");
    setLocation("/");
  };

  if (gameLoading && existingGameId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (resolvedGameId && resolvedType === "tcg") {
    return <TCGEditor gameId={resolvedGameId} onBack={handleBack} />;
  }

  if (resolvedGameId && resolvedType === "pcg") {
    return <PCGCardManager gameId={resolvedGameId} onBack={handleBack} />;
  }

  if (gameType === "pcg" && pcgStep === "create" && !resolvedGameId) {
    return (
      <PCGGameCreateForm
        onSubmit={handlePCGCreateGame}
        onCancel={() => {
          setGameType(null);
          setPcgStep("create");
        }}
      />
    );
  }

  return (
    <>
      <GameTypeSelector onSelect={handleSelectType} />
      <Dialog open={tcgDuplicateDialog.open} onOpenChange={(open) => setTcgDuplicateDialog(d => ({ ...d, open }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle style={{ fontFamily: "'Orbitron', sans-serif" }}>同名のゲームがあります</DialogTitle>
            <DialogDescription style={{ fontFamily: "'Rajdhani', sans-serif" }} className="text-base pt-1">
              「新しいTCGゲーム」はすでに存在します。どうしますか？
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col gap-2 sm:flex-col">
            <Button
              className="w-full"
              onClick={() => setLocation(`/create/${tcgDuplicateDialog.existingGameId}`)}
            >
              既存を開く
            </Button>
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => setTcgDuplicateDialog({ open: false, existingGameId: null })}
            >
              キャンセル
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
