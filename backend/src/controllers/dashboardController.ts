import { Response } from 'express';
import { prisma } from '../index';
import { AuthRequest } from '../middleware/auth';

export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Total students
    const totalStudents = await prisma.user.count({ where: { role: 'STUDENT' } });

    // Today's attendance
    const todayAttendance = await prisma.attendance.findMany({
      where: {
        session: {
          startTime: { gte: today, lt: tomorrow },
        },
      },
      select: { status: true },
    });

    const todayAbsences = todayAttendance.filter(a => a.status === 'ABSENT').length;
    const lateArrivals = todayAttendance.filter(a => a.status === 'LATE').length;
    const presentCount = todayAttendance.filter(a => a.status === 'PRESENT').length;
    const avgAttendance = todayAttendance.length > 0 
      ? Math.round((presentCount / todayAttendance.length) * 100) 
      : 0;

    // Weekly data
    const weeklyData = [];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const dayRecords = await prisma.attendance.findMany({
        where: {
          session: {
            startTime: { gte: date, lt: nextDate },
          },
        },
        select: { status: true },
      });

      const present = dayRecords.filter(r => r.status === 'PRESENT').length;
      const total = dayRecords.length;

      weeklyData.push({
        name: days[date.getDay()],
        attendance: total > 0 ? Math.round((present / total) * 100) : 0,
        absences: dayRecords.filter(r => r.status === 'ABSENT').length,
      });
    }

    // Department stats
    const departments = await prisma.department.findMany({
      include: {
        users: {
          include: {
            attendances: {
              select: { status: true },
            },
          },
          where: { role: 'STUDENT' },
        },
      },
    });

    const departmentStats = departments.map(dept => {
      const allAttendances = dept.users.flatMap(u => u.attendances);
      const present = allAttendances.filter(a => a.status === 'PRESENT').length;
      const total = allAttendances.length;
      return {
        name: dept.name.substring(0, 6),
        value: total > 0 ? Math.round((present / total) * 100) : 0,
      };
    });

    // Recent absences
    const recentAbsences = await prisma.attendance.findMany({
      where: { status: 'ABSENT' },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        user: { select: { firstName: true, lastName: true } },
        session: {
          include: {
            class: { select: { name: true } },
          },
        },
      },
    });

    res.json({
      totalStudents,
      avgAttendance,
      todayAbsences,
      lateArrivals,
      weeklyTrend: weeklyData,
      departmentStats,
      recentAbsences: recentAbsences.map(a => ({
        name: `${a.user.firstName} ${a.user.lastName}`,
        class: a.session.class.name,
        time: a.createdAt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        reason: 'Unexcused',
      })),
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getJustifications = async (req: AuthRequest, res: Response) => {
  try {
    const justifications = await prisma.justification.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
        attendance: {
          include: {
            session: {
              include: {
                class: { select: { name: true } },
              },
            },
          },
        },
      },
    });

    res.json(justifications);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const reviewJustification = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { status, reviewComment } = req.body;

  try {
    const justification = await prisma.justification.update({
      where: { id },
      data: {
        status,
        reviewedBy: req.user?.id,
        reviewComment,
      },
    });

    res.json(justification);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
