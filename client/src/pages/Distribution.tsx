import { Link } from "wouter";
import { ArrowLeft, Construction } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";

export default function Distribution() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-6 max-w-md"
      >
        <Header size="sm" />
        <div className="w-20 h-20 rounded-md bg-amber-500/10 flex items-center justify-center mx-auto">
          <Construction className="w-10 h-10 text-amber-500" />
        </div>
        <h2
          className="text-2xl font-bold"
          style={{ fontFamily: "'Orbitron', sans-serif" }}
        >
          配信 / Distribution
        </h2>
        <p className="text-muted-foreground text-lg" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
          この機能は現在準備中です。
          <br />
          カードゲームの公開・販売機能は今後のアップデートで利用可能になります。
        </p>
        <Button
          data-testid="link-back-home"
          variant="outline"
          asChild
        >
          <Link href="/">
            <ArrowLeft className="w-4 h-4" /> TOPに戻る
          </Link>
        </Button>
      </motion.div>
    </div>
  );
}
