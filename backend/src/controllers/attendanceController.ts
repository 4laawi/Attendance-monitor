import { Request, Response } from 'express';
import { prisma, io } from '../index';
import { AuthRequest } from '../middleware/auth';
import { z } from 'zod';
import crypto from 'crypto';

export const markAttendance = async (req: AuthRequest, res: Response) => {
  const { sessionId, status, userId, location } = req.body;

  try {
    const attendance = await prisma.attendance.upsert({
      where: {
        userId_sessionId: {
          userId,
          sessionId,
        },
      },
      update: {
        status,
        markedBy: req.user?.id,
        markedAt: new Date(),
        location,
      },
      create: {
        userId,
        sessionId,
        status,
        markedBy: req.user?.id,
        markedAt: new Date(),
        location,
      },
    });

    // Notify real-time via Socket.io
    io.to(`session-${sessionId}`).emit('attendance-updated', attendance);

    // Create Audit Log
    await prisma.auditLog.create({
      data: {
        userId: req.user?.id!,
        action: 'MARK_ATTENDANCE',
        entity: 'Attendance',
        entityId: attendance.id,
        details: JSON.stringify({ status, userId, sessionId }),
      },
    });

    res.json(attendance);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const generateQR = async (req: AuthRequest, res: Response) => {
  const { sessionId } = req.params;

  try {
    const qrToken = crypto.randomBytes(32).toString('hex');
    const qrExpiresAt = new Date(Date.now() + 60 * 1000); // 1 minute expiry

    const session = await prisma.session.update({
      where: { id: sessionId },
      data: {
        qrCode: qrToken,
        qrExpiresAt,
      },
    });

    res.json({ qrToken, qrExpiresAt: session.qrExpiresAt });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const scanQR = async (req: AuthRequest, res: Response) => {
  const { sessionId, qrToken, location } = req.body;
  const userId = req.user?.id!;

  try {
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session || session.qrCode !== qrToken || !session.qrExpiresAt || session.qrExpiresAt < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired QR code' });
    }

    const attendance = await prisma.attendance.upsert({
      where: {
        userId_sessionId: {
          userId,
          sessionId,
        },
      },
      update: {
        status: 'PRESENT',
        markedAt: new Date(),
        location,
      },
      create: {
        userId,
        sessionId,
        status: 'PRESENT',
        markedAt: new Date(),
        location,
      },
    });

    io.to(`session-${sessionId}`).emit('attendance-updated', attendance);

    res.json({ message: 'Attendance marked successfully', attendance });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
