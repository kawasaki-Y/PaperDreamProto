import { Bot, Sparkles, Check, AlertCircle } from "lucide-react";
import { type BalanceResponse } from "@shared/schema";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

interface AIPanelProps {
  onAnalyze: () => void;
  onApply: (suggestion: BalanceResponse) => void;
  isAnalyzing: boolean;
  suggestion: BalanceResponse | null;
  error?: string | null;
}

export function AIPanel({ onAnalyze, onApply, isAnalyzing, suggestion, error }: AIPanelProps) {
  return (
    <div className="h-full flex flex-col bg-card/30 rounded-md border border-border/50 overflow-hidden shadow-xl backdrop-blur-sm">
      <div className="p-6 border-b border-border/50 bg-black/20">
        <h2 className="flex items-center gap-3 text-xl font-['Orbitron'] text-primary">
          <Bot className="w-6 h-6" />
          AIバランスエンジン
        </h2>
        <p className="text-sm text-muted-foreground mt-2">
          カードのステータスと効果を分析し、バランスの取れたゲームプレイを実現します。
        </p>
      </div>

      <div className="flex-1 p-6 relative">
        <AnimatePresence mode="wait">
          {!suggestion && !isAnalyzing && !error && (
            <motion.div 
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full flex flex-col items-center justify-center text-center text-muted-foreground space-y-4"
            >
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                <Sparkles className="w-8 h-8 text-primary/50" />
              </div>
              <p>カードの分析準備ができています。</p>
            </motion.div>
          )}

          {isAnalyzing && (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full flex flex-col items-center justify-center text-center space-y-6"
            >
              <div className="relative">
                <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Bot className="w-6 h-6 text-primary animate-pulse" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-['Orbitron'] text-primary">バランス分析中...</h3>
                <p className="text-sm text-muted-foreground">パワーカーブとシナジーを確認中</p>
              </div>
            </motion.div>
          )}

          {error && (
            <motion.div 
              key="error"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="h-full flex flex-col items-center justify-center text-center space-y-4 p-4"
            >
              <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
                <AlertCircle className="w-6 h-6" />
              </div>
              <p className="text-destructive font-medium">{error}</p>
            </motion.div>
          )}

          {suggestion && !isAnalyzing && (
            <motion.div 
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="bg-primary/5 border border-primary/20 rounded-md p-4">
                <h3 className="text-sm font-['Orbitron'] uppercase tracking-wider text-primary mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> 分析完了
                </h3>
                <p className="text-sm leading-relaxed text-foreground/90 font-['Rajdhani'] font-medium">
                  {suggestion.reason}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/20 p-4 rounded-md border border-white/5 text-center">
                  <span className="text-xs uppercase text-muted-foreground block mb-1">推奨 攻撃力</span>
                  <span className="text-3xl font-['Orbitron'] text-red-400">{suggestion.suggested_attack}</span>
                </div>
                <div className="bg-black/20 p-4 rounded-md border border-white/5 text-center">
                  <span className="text-xs uppercase text-muted-foreground block mb-1">推奨 HP</span>
                  <span className="text-3xl font-['Orbitron'] text-blue-400">{suggestion.suggested_hp}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="p-6 border-t border-border/50 bg-black/20 space-y-3">
        {suggestion && !isAnalyzing && (
          <Button
            data-testid="button-apply-suggestion"
            variant="secondary"
            className="w-full"
            onClick={() => onApply(suggestion)}
          >
            <Check className="w-4 h-4" />
            提案を適用
          </Button>
        )}
        
        <Button
          data-testid="button-balance-check"
          className="w-full"
          onClick={onAnalyze}
          disabled={isAnalyzing}
        >
          {isAnalyzing ? "分析中..." : (
            <>
              <Bot className="w-4 h-4" />
              バランスチェック実行
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
