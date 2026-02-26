import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage.ts";
import { api } from "@shared/routes";
import { z } from "zod";
import Anthropic from "@anthropic-ai/sdk";
import multer from "multer";
import path from "path";
import fs from "fs";
import express from "express";

const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const multerStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
    cb(null, name);
  },
});

const upload = multer({
  storage: multerStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowedExt = /\.(jpg|jpeg|png|gif|webp|svg)$/i;
    const allowedMime = /^image\/(jpeg|jpg|png|gif|webp|svg\+xml)$/i;
    if (allowedExt.test(path.extname(file.originalname)) && allowedMime.test(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("画像ファイルのみアップロードできます (JPEG, PNG, GIF, WebP, SVG)"));
    }
  },
});

const anthropic = new Anthropic({
  apiKey: process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL,
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.get("/api/games", async (_req, res) => {
    const games = await storage.getGames();
    res.json(games);
  });

  app.get("/api/games/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid game ID" });
    const game = await storage.getGame(id);
    if (!game) return res.status(404).json({ message: "ゲームが見つかりません" });
    res.json(game);
  });

  app.post("/api/games", async (req, res) => {
    try {
      const input = api.games.create.input.parse(req.body);
      const title = input.title.trim();
      if (!title) {
        return res.status(400).json({ message: "ゲーム名を入力してください" });
      }
      const existing = await storage.getGameByTitle(title);
      if (existing) {
        return res.status(409).json({ error: "DUPLICATE_TITLE", existingGameId: existing.id, message: "同名のゲームが存在します" });
      }
      const game = await storage.createGame({ ...input, title });
      res.status(201).json(game);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  app.put("/api/games/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid game ID" });
    const game = await storage.updateGame(id, req.body);
    if (!game) return res.status(404).json({ message: "ゲームが見つかりません" });
    res.json(game);
  });

  app.delete("/api/games/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid game ID" });
    const success = await storage.deleteGame(id);
    if (!success) return res.status(404).json({ message: "ゲームが見つかりません" });
    res.json({ success: true });
  });

  app.get("/api/games/:id/cards", async (req, res) => {
    const gameId = parseInt(req.params.id);
    if (isNaN(gameId)) return res.status(400).json({ message: "Invalid game ID" });
    const cards = await storage.getCardsByGame(gameId);
    res.json(cards);
  });

  app.post("/api/games/:id/cards", async (req, res) => {
    try {
      const gameId = parseInt(req.params.id);
      if (isNaN(gameId)) return res.status(400).json({ message: "Invalid game ID" });
      const game = await storage.getGame(gameId);
      if (!game) return res.status(404).json({ message: "ゲームが見つかりません" });
      const cardData = { ...req.body, gameId };
      const card = await storage.createCard(cardData);
      res.status(201).json(card);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  app.put("/api/cards/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid card ID" });
    const card = await storage.updateCard(id, req.body);
    if (!card) return res.status(404).json({ message: "カードが見つかりません" });
    res.json(card);
  });

  app.delete("/api/cards/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid card ID" });
    const success = await storage.deleteCard(id);
    if (!success) return res.status(404).json({ message: "カードが見つかりません" });
    res.json({ success: true });
  });

  app.use("/uploads", express.static(uploadDir));

  app.post("/api/upload", (req, res) => {
    upload.single("file")(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({ message: "ファイルサイズが大きすぎます（最大10MB）" });
          }
          return res.status(400).json({ message: `アップロードエラー: ${err.message}` });
        }
        return res.status(400).json({ message: err.message || "画像のアップロードに失敗しました" });
      }
      if (!req.file) {
        return res.status(400).json({ message: "ファイルが選択されていません" });
      }
      const url = `/uploads/${req.file.filename}`;
      res.json({ url, filename: req.file.filename, size: req.file.size, type: req.file.mimetype });
    });
  });

  app.post(api.balance.suggest.path, async (req, res) => {
    try {
      const { name, attack, hp, effect, type } = api.balance.suggest.input.parse(req.body);

      const prompt = `あなたはカードゲームのバランス調整アシスタントです。以下のカードのステータスを評価し、適切な値を提案してください。
カードゲームは遊戯王やハースストーンのような対戦型を想定しています。
攻撃力とHPは0〜10の範囲が一般的ですが、強力な効果を持つ場合は低めに設定されるべきです。

カード情報:
- 名前: ${name}
- タイプ: ${type}
- 現在の攻撃力: ${attack}
- 現在のHP: ${hp}
- 効果テキスト: ${effect}

以下のJSON形式のみを返してください。それ以外のテキストは含めないでください。
{
  "suggested_attack": number, // 推奨される攻撃力 (整数)
  "suggested_hp": number, // 推奨されるHP (整数)
  "reason": "string" // 提案の理由 (日本語で簡潔に)
}`;

      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-5",
        max_tokens: 1024,
        messages: [{ role: "user", content: prompt }],
      });

      const contentBlock = response.content[0];
      if (contentBlock.type !== "text") {
        throw new Error("Unexpected response from AI");
      }

      const jsonString = contentBlock.text.match(/\{[\s\S]*\}/)?.[0];
      if (!jsonString) {
        throw new Error("Failed to parse JSON from AI response");
      }

      const suggestion = JSON.parse(jsonString);
      const validatedSuggestion = {
        suggested_attack: Number(suggestion.suggested_attack),
        suggested_hp: Number(suggestion.suggested_hp),
        reason: String(suggestion.reason)
      };

      res.json(validatedSuggestion);
    } catch (err) {
      console.error("AI Balance Check Error:", err);
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      } else {
        res.status(500).json({ message: "AI API request failed" });
      }
    }
  });

  return httpServer;
}
