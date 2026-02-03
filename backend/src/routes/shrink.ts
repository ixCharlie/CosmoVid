import { Router, Request, Response } from 'express';
import multer from 'multer';
import { spawn } from 'child_process';
import { unlink } from 'fs/promises';
import path from 'path';
import { randomBytes } from 'crypto';
import rateLimit from 'express-rate-limit';
import { SHRINK_MAX_BYTES, SHRINK_MAX_MB_DISPLAY, TEMP_DIR, RATE_LIMIT_WINDOW_MS } from '../config';

const SHRINK_RATE_MAX = 5; // 5 shrink requests per minute per IP

const limiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  max: SHRINK_RATE_MAX,
  message: { success: false, error: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const storage = multer.diskStorage({
  destination: TEMP_DIR,
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '.mp4';
    cb(null, `shrink-in-${randomBytes(8).toString('hex')}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: SHRINK_MAX_BYTES },
  fileFilter: (_req, file, cb) => {
    const allowed = /^video\//.test(file.mimetype) || /\.(mp4|webm|mov|avi|mkv)$/i.test(file.originalname);
    if (allowed) cb(null, true);
    else cb(new Error('Only video files are allowed.'));
  },
});

export const shrinkRouter = Router();

/** Return max upload size so the frontend can show "Max X MB". */
shrinkRouter.get('/limit', (_req: Request, res: Response) => {
  res.json({ maxBytes: SHRINK_MAX_BYTES, maxMb: SHRINK_MAX_MB_DISPLAY });
});

shrinkRouter.use(limiter);

shrinkRouter.post('/', (req: Request, res: Response) => {
  const handle = upload.single('video');
  handle(req, res, async (err: unknown) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            error: `Video must be ${SHRINK_MAX_MB_DISPLAY}MB or less.`,
          });
        }
      }
      return res.status(400).json({
        success: false,
        error: err instanceof Error ? err.message : 'Invalid upload.',
      });
    }

    const file = (req as Request & { file?: Express.Multer.File }).file;
    if (!file?.path) {
      return res.status(400).json({ success: false, error: 'No video file uploaded.' });
    }

    const inputPath = file.path;
    const outputName = `shrink-out-${randomBytes(8).toString('hex')}.mp4`;
    const outputPath = path.join(TEMP_DIR, outputName);

    const ffmpeg = spawn(
      'ffmpeg',
      [
        '-i', inputPath,
        '-c:v', 'libx264',
        '-crf', '28',
        '-preset', 'medium',
        '-vf', 'scale=-2:720',
        '-c:a', 'aac',
        '-b:a', '128k',
        '-movflags', '+faststart',
        '-y',
        outputPath,
      ],
      { stdio: ['ignore', 'pipe', 'pipe'] }
    );

    let stderr = '';
    ffmpeg.stderr?.on('data', (chunk: Buffer) => { stderr += chunk.toString(); });

    ffmpeg.on('close', async (code) => {
      try {
        await unlink(inputPath).catch(() => {});
      } catch {
        // ignore
      }

      if (res.headersSent) return;

      if (code !== 0) {
        try {
          await unlink(outputPath).catch(() => {});
        } catch {
          // ignore
        }
        return res.status(500).json({
          success: false,
          error: 'Video compression failed. Make sure the file is a valid video.',
        });
      }

      res.setHeader('Content-Disposition', `attachment; filename="shrunk-${path.basename(file.originalname, path.extname(file.originalname))}.mp4"`);
      res.setHeader('Content-Type', 'video/mp4');
      res.sendFile(outputPath, async (err) => {
        try {
          await unlink(outputPath).catch(() => {});
        } catch {
          // ignore
        }
        if (err && !res.headersSent) {
          res.status(500).json({ success: false, error: 'Failed to send file.' });
        }
      });
    });

    ffmpeg.on('error', () => {
      if (res.headersSent) return;
      res.status(500).json({
        success: false,
        error: 'Server error: ffmpeg not available. Please install ffmpeg on the server.',
      });
    });
  });
});
