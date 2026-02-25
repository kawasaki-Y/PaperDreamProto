import { motion } from "framer-motion";
import { clsx } from "clsx";
import { Sword, Heart, Sparkles, Shield, Skull } from "lucide-react";

interface CardPreviewProps {
  name: string;
  attack: number;
  hp: number;
  effect: string;
  type: "monster" | "spell" | "trap";
  isLoading?: boolean;
}

export function CardPreview({ name, attack, hp, effect, type, isLoading }: CardPreviewProps) {
  const getTypeColor = () => {
    switch (type) {
      case "monster": return "text-[hsl(35,90%,50%)] border-[hsl(35,90%,50%)]";
      case "spell": return "text-[hsl(150,80%,40%)] border-[hsl(150,80%,40%)]";
      case "trap": return "text-[hsl(280,70%,50%)] border-[hsl(280,70%,50%)]";
      default: return "text-primary border-primary";
    }
  };

  const getGradientClass = () => {
    switch (type) {
      case "monster": return "card-gradient-monster";
      case "spell": return "card-gradient-spell";
      case "trap": return "card-gradient-trap";
      default: return "bg-card";
    }
  };

  const getTypeIcon = () => {
    switch (type) {
      case "monster": return <Skull className="w-5 h-5" />;
      case "spell": return <Sparkles className="w-5 h-5" />;
      case "trap": return <Shield className="w-5 h-5" />;
    }
  };

  return (
    <div className="relative group perspective-1000 w-full max-w-sm mx-auto aspect-[2.5/3.5]">
      <motion.div 
        layout
        className={clsx(
          "relative w-full h-full rounded-2xl border-4 shadow-2xl overflow-hidden foil-effect transition-all duration-500",
          getGradientClass(),
          isLoading ? "opacity-80 blur-sm scale-[0.98]" : "opacity-100 blur-0 scale-100"
        )}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Card Header */}
        <div className="p-4 flex justify-between items-center border-b border-white/10 bg-black/20 backdrop-blur-sm">
          <h3 className="font-['Cinzel'] font-bold text-xl text-white truncate drop-shadow-md">
            {name || "Unknown Card"}
          </h3>
          <div className={clsx("p-1.5 rounded-full bg-black/40 shadow-inner", getTypeColor())}>
            {getTypeIcon()}
          </div>
        </div>

        {/* Card Art Placeholder */}
        <div className="mx-4 mt-4 aspect-video bg-black/30 rounded-lg border border-white/10 flex items-center justify-center overflow-hidden relative shadow-inner">
            {/* dynamic grid pattern */}
            <div className="absolute inset-0 opacity-20" 
                 style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '10px 10px' }}>
            </div>
            
            <motion.div 
              className="text-white/20"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
              {type === 'monster' && <Skull className="w-16 h-16" />}
              {type === 'spell' && <Sparkles className="w-16 h-16" />}
              {type === 'trap' && <Shield className="w-16 h-16" />}
            </motion.div>
        </div>

        {/* Stats Strip */}
        {type === 'monster' && (
          <div className="flex justify-between items-center px-6 py-2 mt-4 bg-black/40 mx-4 rounded-md border border-white/5">
            <div className="flex items-center gap-2 text-red-400 font-['Orbitron'] font-bold text-lg">
              <Sword className="w-4 h-4" />
              <span>ATK / {attack}</span>
            </div>
            <div className="h-4 w-px bg-white/10"></div>
            <div className="flex items-center gap-2 text-blue-400 font-['Orbitron'] font-bold text-lg">
              <span>HP / {hp}</span>
              <Heart className="w-4 h-4" />
            </div>
          </div>
        )}

        {/* Effect Text */}
        <div className="absolute bottom-4 left-4 right-4 top-[55%] bg-black/40 rounded-lg p-4 border border-white/10 backdrop-blur-md">
            <div className="h-full overflow-y-auto pr-1 custom-scrollbar">
                <p className="font-['Rajdhani'] text-lg leading-relaxed text-white/90">
                    {effect || "No effect description..."}
                </p>
            </div>
        </div>
        
        {/* Footer Type Label */}
        <div className="absolute bottom-0 w-full p-2 text-center text-[10px] font-['Orbitron'] uppercase tracking-[0.2em] text-white/40 bg-black/60">
            {type.toUpperCase()} CARD
        </div>

      </motion.div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-20">
            <div className="absolute inset-0 bg-background/50 backdrop-blur-[2px] rounded-2xl"></div>
            <div className="relative animate-pulse">
                <Sparkles className="w-12 h-12 text-primary" />
            </div>
        </div>
      )}
    </div>
  );
}
