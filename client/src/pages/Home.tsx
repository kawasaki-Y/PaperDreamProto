import { useState } from "react";
import { Link } from "wouter";
import { Pen, Printer, Send, Clock, ArrowRight, Gamepad2, PartyPopper, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useGames, useDeleteGame } from "@/hooks/use-cards";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const menuItems = [
  {
    title: "創作",
    subtitle: "Deckbuilding",
    description: "カードの作成、評価、改善",
    icon: Pen,
    href: "/create",
    color: "from-violet-600 to-purple-800",
  },
  {
    title: "出力",
    subtitle: "Visual Preview",
    description: "印刷データの生成とプレビュー",
    icon: Printer,
    href: "/preview",
    color: "from-cyan-600 to-teal-800",
  },
  {
    title: "配信",
    subtitle: "Distribution",
    description: "カードゲームの公開と販売",
    icon: Send,
    href: "/distribute",
    color: "from-amber-600 to-orange-800",
  },
];

export default function Home() {
  const { data: games } = useGames();
  const deleteGameMutation = useDeleteGame();
  const [isCollectionOpen, setIsCollectionOpen] = useState(false);

  const handleDelete = (e: React.MouseEvent, gameId: number) => {
    e.preventDefault();
    e.stopPropagation();
    deleteGameMutation.mutate(gameId);
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-6 relative overflow-x-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px]" />
        <div className="absolute top-20 left-20 w-[300px] h-[300px] bg-secondary/5 rounded-full blur-[80px]" />
      </div>

      <div className="relative z-10 max-w-5xl w-full pt-16 pb-12 space-y-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center space-y-4"
        >
          <h1
            data-testid="text-logo"
            className="text-5xl md:text-7xl font-bold tracking-wider"
            style={{ fontFamily: "'Libre Baskerville', 'Playfair Display', serif" }}
          >
            PAPER DREAM
          </h1>
          <div className="h-0.5 w-24 bg-gradient-to-r from-transparent via-foreground/30 to-transparent mx-auto rounded-full" />
          <p className="text-muted-foreground text-lg" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
            創作と変革の旅に出よう
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.7 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {menuItems.map((item, i) => {
            const Icon = item.icon;
            return (
              <Link
                key={i}
                href={item.href}
                data-testid={`link-menu-${item.subtitle.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <Card className="hover-elevate active-elevate-2 cursor-pointer h-full overflow-visible">
                  <CardContent className="p-8 flex flex-col items-center text-center gap-4">
                    <div className={`w-16 h-16 rounded-md bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h2
                        className="text-2xl font-bold mb-1"
                        style={{ fontFamily: "'Rajdhani', sans-serif" }}
                      >
                        {item.title}
                      </h2>
                      <p
                        className="text-xs text-muted-foreground uppercase tracking-[0.2em]"
                        style={{ fontFamily: "'Orbitron', sans-serif" }}
                      >
                        {item.subtitle}
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
                      {item.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.7 }}
        >
          <Card className="overflow-visible">
            <CardContent className="p-6 space-y-0">
              <div
                className="flex items-center justify-between cursor-pointer gap-4 flex-wrap"
                onClick={() => setIsCollectionOpen(!isCollectionOpen)}
                data-testid="button-toggle-collection"
              >
                <div>
                  <h2
                    data-testid="text-my-collection"
                    className="text-2xl font-bold tracking-wider"
                    style={{ fontFamily: "'Orbitron', sans-serif" }}
                  >
                    MY COLLECTION
                  </h2>
                  <p className="text-sm text-muted-foreground" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
                    保存済みのカードゲームを編集できます
                  </p>
                </div>
                <Button variant="ghost" size="sm" data-testid="button-collection-chevron">
                  {isCollectionOpen ? (
                    <><ChevronUp className="w-4 h-4" /> 閉じる</>
                  ) : (
                    <><ChevronDown className="w-4 h-4" /> 展開する</>
                  )}
                </Button>
              </div>

              <AnimatePresence>
                {isCollectionOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="pt-6 space-y-3">
                      {(!games || games.length === 0) ? (
                        <div className="text-center py-8">
                          <p className="text-muted-foreground text-sm" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
                            まだゲームが保存されていません。「創作」から最初のカードゲームを作りましょう。
                          </p>
                        </div>
                      ) : (
                        games.map((game) => {
                          const isPCG = game.description?.startsWith("[PCG]");
                          const displayDescription = game.description
                            ? game.description.replace(/^\[PCG\]\s*/, "").replace(/^\[TCG\]\s*/, "")
                            : null;
                          const IconComp = isPCG ? PartyPopper : Gamepad2;
                          const iconColor = isPCG ? "from-amber-500 to-orange-700" : "from-violet-600 to-purple-800";

                          return (
                            <Link key={game.id} href={`/create/${game.id}`} data-testid={`link-game-${game.id}`}>
                              <div className="group flex items-center justify-between gap-4 p-4 rounded-md hover-elevate active-elevate-2 cursor-pointer border border-border/50 flex-wrap">
                                <div className="flex items-center gap-4 min-w-0">
                                  <div className={`w-10 h-10 rounded-md flex items-center justify-center text-white text-sm font-bold shrink-0 bg-gradient-to-br ${iconColor}`}>
                                    <IconComp className="w-5 h-5" />
                                  </div>
                                  <div className="min-w-0">
                                    <h3 className="font-bold text-lg truncate" style={{ fontFamily: "'Cinzel', serif" }}>
                                      {game.title}
                                    </h3>
                                    <p className="text-xs text-muted-foreground flex items-center gap-2 flex-wrap">
                                      <Clock className="w-3 h-3" />
                                      {game.createdAt
                                        ? new Date(game.createdAt).toLocaleDateString("ja-JP")
                                        : "—"}
                                      {displayDescription && (
                                        <>
                                          <span className="text-foreground/60">|</span>
                                          <span className="truncate">{displayDescription}</span>
                                        </>
                                      )}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button
                                    data-testid={`button-delete-game-${game.id}`}
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e) => handleDelete(e, game.id)}
                                    disabled={deleteGameMutation.isPending}
                                    className="invisible group-hover:visible"
                                  >
                                    <Trash2 className="w-4 h-4 text-destructive" />
                                  </Button>
                                  <span
                                    className="text-xs text-primary shrink-0 invisible group-hover:visible flex items-center gap-1"
                                    style={{ fontFamily: "'Rajdhani', sans-serif" }}
                                  >
                                    続きを編集 <ArrowRight className="w-3 h-3" />
                                  </span>
                                </div>
                              </div>
                            </Link>
                          );
                        })
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
