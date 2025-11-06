import {
  AuthError,
  NotFoundError,
  ValidationError,
} from "packages/error-handler";
import prisma from "packages/libs/prisma";
import { NextFunction, Request, Response } from "express";
import redis from "packages/libs/redis";
import {
  clearUnseenCount,
  getUnseenCount,
} from "packages/libs/redis/messageRedis";

export const newConversation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { sellerId } = req.body;
    const userId = (req as any).user.id;

    if (!sellerId) return next(new ValidationError("Seller id is required!"));

    const existingGroup = await prisma.conversationGroup.findFirst({
      where: {
        isGroup: false,
        participantIds: {
          hasEvery: [userId, sellerId],
        },
      },
    });

    if (existingGroup)
      return res
        .status(200)
        .json({ conversation: existingGroup, isNew: false });

    const newGroup = await prisma.conversationGroup.create({
      data: {
        isGroup: false,
        creatorId: userId,
        participantIds: [userId, sellerId],
      },
    });

    await prisma.participant.createMany({
      data: [
        { conversationId: newGroup.id, userId },
        { conversationId: newGroup.id, sellerId },
      ],
    });

    return res.status(201).json({ conversation: newGroup, isNew: true });
  } catch (err) {
    return next(err);
  }
};

export const getUserConversations = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user.id;

    const conversations = await prisma.conversationGroup.findMany({
      where: {
        participantIds: { has: userId },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    const resData = await Promise.all(
      conversations.map(async (conversation) => {
        const sellerParticipant = await prisma.participant.findFirst({
          where: {
            conversationId: conversation.id,
            sellerId: { not: null },
          },
        });

        let seller = null;
        if (sellerParticipant?.sellerId) {
          seller = await prisma.sellers.findUnique({
            where: { id: sellerParticipant?.sellerId },
            include: {
              shop: {
                include: {
                  avatar: true,
                },
              },
            },
          });
        }

        const lastMessage = await prisma.message.findFirst({
          where: { conversationId: conversation.id },
          orderBy: { createdAt: "desc" },
        });

        let isOnline = false;
        if (sellerParticipant?.sellerId) {
          const redisKey = `online:seller:${sellerParticipant.sellerId}`;
          const redisRes = await redis.get(redisKey);
          isOnline = !!redisRes;
        }

        const unreadCount = await getUnseenCount("user", conversation.id);
        return {
          conversationId: conversation.id,
          seller: {
            id: seller?.id || null,
            name: seller?.shop?.name || "Unknown",
            isOnline,
            avatar: seller?.shop?.avatar?.[0]?.url,
          },
          lastMessage:
            lastMessage?.content || "Say something to start a conversation",
          lastMessageAt: lastMessage?.createdAt || conversation.updatedAt,
          unreadCount,
        };
      })
    );

    return res.status(200).json({
      conversations: resData,
    });
  } catch (err) {
    return next(err);
  }
};

export const getSellerConversations = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const sellerId = (req as any).seller.id;

    const conversations = await prisma.conversationGroup.findMany({
      where: {
        participantIds: { has: sellerId },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    const resData = await Promise.all(
      conversations.map(async (conversation) => {
        const userParticipant = await prisma.participant.findFirst({
          where: {
            conversationId: conversation.id,
            userId: { not: null },
          },
        });

        let user = null;
        if (userParticipant?.userId) {
          user = await prisma.users.findUnique({
            where: { id: userParticipant?.userId },
            include: {
              avatar: true,
            },
          });
        }

        const lastMessage = await prisma.message.findFirst({
          where: { conversationId: conversation.id },
          orderBy: { createdAt: "desc" },
        });

        let isOnline = false;
        if (userParticipant?.userId) {
          const redisKey = `online:user:user_${userParticipant.userId}`;
          const redisRes = await redis.get(redisKey);
          isOnline = !!redisRes;
        }

        const unreadCount = await getUnseenCount("seller", conversation.id);
        return {
          conversationId: conversation.id,
          user: {
            id: user?.id || null,
            name: user?.name || "Unknown",
            isOnline,
            avatar: user?.avatar,
          },
          lastMessage:
            lastMessage?.content || "Say something to start a conversation",
          lastMessageAt: lastMessage?.createdAt || conversation.updatedAt,
          unreadCount,
        };
      })
    );

    return res.status(200).json({
      conversations: resData,
    });
  } catch (err) {
    return next(err);
  }
};

export const fetchUserMessages = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { conversationId } = req.params;
    const userId = (req as any).user.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = 10;

    if (!conversationId)
      return next(new ValidationError("Conversation Id is required!"));
    const conversation = await prisma.conversationGroup.findUnique({
      where: { id: conversationId },
    });

    if (!conversation)
      return next(new NotFoundError("Conversation not found!"));

    const hasAccess = conversation.participantIds.includes(userId);
    if (!hasAccess)
      return next(new AuthError("Access denied to this conversation"));

    await clearUnseenCount("user", conversationId);

    const sellerParticipant = await prisma.participant.findFirst({
      where: {
        conversationId,
        sellerId: { not: null },
      },
    });

    let seller = null;
    let isOnline = false;

    if (sellerParticipant?.sellerId) {
      seller = await prisma.sellers.findUnique({
        where: {
          id: sellerParticipant?.sellerId,
        },
        include: {
          shop: {
            include: {
              avatar: true,
            },
          },
        },
      });
      const redisKey = `online:seller:${sellerParticipant?.sellerId}`;
      const redisRes = await redis.get(redisKey);
      isOnline = !!redisRes;
    }

    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit + 1,
    });

    return res.status(200).json({
      messages,
      seller: {
        id: seller?.id || null,
        name: seller?.shop?.name || "Unknown",
        avatar: seller?.shop?.avatar?.[0]?.url,
        isOnline,
      },
      currentPage: page,
      hasMore: messages.length > limit,
    });
  } catch (err) {
    return next(err);
  }
};

export const fetchSellerMessages = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { conversationId } = req.params;
    const sellerId = (req as any).seller.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = 10;

    if (!conversationId)
      return next(new ValidationError("Conversation Id is required!"));
    const conversation = await prisma.conversationGroup.findUnique({
      where: { id: conversationId },
    });

    if (!conversation)
      return next(new NotFoundError("Conversation not found!"));

    const hasAccess = conversation.participantIds.includes(sellerId);
    if (!hasAccess)
      return next(new AuthError("Access denied to this conversation"));

    await clearUnseenCount("seller", conversationId);

    const userParticipant = await prisma.participant.findFirst({
      where: {
        conversationId,
        userId: { not: null },
      },
    });

    let user = null;
    let isOnline = false;

    if (userParticipant?.userId) {
      user = await prisma.users.findUnique({
        where: {
          id: userParticipant?.userId,
        },
        include: {
          avatar: true,
        },
      });
      const redisKey = `online:user:user_${userParticipant?.userId}`;
      const redisRes = await redis.get(redisKey);
      isOnline = !!redisRes;
    }

    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit + 1,
    });

    return res.status(200).json({
      messages,
      seller: {
        id: user?.id || null,
        name: user?.name || "Unknown",
        avatar: user?.avatar,
        isOnline,
      },
      currentPage: page,
      hasMore: messages.length > limit,
    });
  } catch (err) {
    return next(err);
  }
};
