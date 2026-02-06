import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../../../lib/mongodb';
import Category from '../../../../../models/Category';
import { authenticated } from '../../../../../lib/auth';

/**
 * Extend NextApiRequest to include `user`
 * injected by the authenticated middleware
 */
interface AuthenticatedRequest extends NextApiRequest {
    user: {
        id: string;
        role: string;
        email?: string;
    };
}

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
    if (req.method !== 'PATCH') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    await dbConnect();

    // Admin check
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied: Admins only' });
    }

    try {
        const { disable } = req.body;
        const { id } = req.query;

        console.log(
            `[DisableAPI] Toggling category ${id}. Disable: ${disable} (type: ${typeof disable})`
        );

        if (typeof disable !== 'boolean') {
            return res
                .status(400)
                .json({ message: 'Invalid payload: disable must be a boolean' });
        }

        const category = await Category.findById(id);

        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        category.isActive = !disable;
        await category.save();

        return res.status(200).json({
            success: true,
            category,
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}

export default authenticated(handler);
