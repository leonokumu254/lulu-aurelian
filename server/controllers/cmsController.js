import { db } from '../config/db.js';
import { emailService } from '../services/emailService.js';

export const getBlogs = async (req, res, next) => {
  try {
    const blogs = await db.blogs.getAll();
    return res.status(200).json({ success: true, blogs });
  } catch (error) {
    next(error);
  }
};

export const createBlog = async (req, res, next) => {
  try {
    const { title, author, category, content } = req.body;
    if (!title || !content) {
      return res.status(400).json({ success: false, error: 'Title and content are required.' });
    }
    const newBlog = await db.blogs.create({ title, author, category, content });
    return res.status(201).json({ success: true, blog: newBlog });
  } catch (error) {
    next(error);
  }
};

export const deleteBlog = async (req, res, next) => {
  try {
    const { id } = req.params;
    const success = await db.blogs.delete(id);
    if (!success) {
      return res.status(404).json({ success: false, error: 'Blog not found.' });
    }
    return res.status(200).json({ success: true, message: 'Blog deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

export const dispatchNewsletter = async (req, res, next) => {
  try {
    const { subject, segment, body } = req.body;
    if (!subject || !body) {
      return res.status(400).json({ success: false, error: 'Subject and body are required.' });
    }

    // Currently segment logic is ignored and sent to all active subscribers, 
    // but in a production app, we would query conditionally based on segment.
    const allSubscribers = await db.newsletters.getActive();
    
    // Asynchronously dispatch
    allSubscribers.forEach(sub => {
      emailService.sendNewsletterCampaign(sub.email, subject, body).catch(err => {
        console.error(`[NEWSLETTER CMS] Failed to send campaign to ${sub.email}`, err);
      });
    });

    return res.status(200).json({ 
      success: true, 
      message: `Newsletter dispatched successfully to ${allSubscribers.length} active subscribers.` 
    });
  } catch (error) {
    next(error);
  }
};
