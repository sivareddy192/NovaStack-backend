import Insight from '../models/Insight.js';
import { seedInsights } from '../config/seedData.js';
import { isDbConnected } from '../config/db.js';

let localInsights = [...seedInsights];

export const getInsights = async (req, res) => {
  try {
    const { category, tag, search } = req.query;

    if (isDbConnected()) {
      try {
        const query = { published: true };
        if (category && category !== 'All') query.category = category;
        if (tag) query.tags = { $in: [tag] };
        if (search) {
          query.$or = [
            { title: { $regex: search, $options: 'i' } },
            { summary: { $regex: search, $options: 'i' } },
          ];
        }

        const insights = await Insight.find(query).sort({ createdAt: -1 });
        if (insights && insights.length > 0) {
          return res.status(200).json({
            success: true,
            count: insights.length,
            data: insights,
          });
        }
      } catch (e) {}
    }

    let filtered = localInsights.filter((i) => i.published !== false);
    if (category && category !== 'All') {
      filtered = filtered.filter((i) => i.category === category);
    }
    if (tag) {
      filtered = filtered.filter((i) => i.tags && i.tags.includes(tag));
    }
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(
        (i) =>
          i.title.toLowerCase().includes(s) ||
          i.summary.toLowerCase().includes(s)
      );
    }

    res.status(200).json({
      success: true,
      count: filtered.length,
      data: filtered,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

export const getInsightBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    try {
      const insight = await Insight.findOneAndUpdate(
        { slug, published: true },
        { $inc: { views: 1 } },
        { new: true }
      );
      if (insight) {
        return res.status(200).json({
          success: true,
          data: insight,
        });
      }
    } catch (e) {}

    const fallback = localInsights.find((i) => i.slug === slug);
    if (!fallback) {
      return res.status(404).json({
        success: false,
        message: 'Insight article not found',
      });
    }

    res.status(200).json({
      success: true,
      data: fallback,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

export const createInsight = async (req, res) => {
  try {
    try {
      const insight = await Insight.create(req.body);
      return res.status(201).json({
        success: true,
        data: insight,
      });
    } catch (e) {
      const newInsight = { ...req.body, _id: `ins-${Date.now()}`, createdAt: new Date() };
      localInsights.unshift(newInsight);
      return res.status(201).json({
        success: true,
        data: newInsight,
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

export const updateInsight = async (req, res) => {
  try {
    const { id } = req.params;
    try {
      const insight = await Insight.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true,
      });
      if (insight) {
        return res.status(200).json({
          success: true,
          data: insight,
        });
      }
    } catch (e) {}

    const index = localInsights.findIndex((i) => i._id === id || i.slug === id);
    if (index !== -1) {
      localInsights[index] = { ...localInsights[index], ...req.body };
      return res.status(200).json({
        success: true,
        data: localInsights[index],
      });
    }

    res.status(404).json({ success: false, message: 'Insight not found' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

export const deleteInsight = async (req, res) => {
  try {
    const { id } = req.params;
    try {
      await Insight.findByIdAndDelete(id);
    } catch (e) {
      localInsights = localInsights.filter((i) => i._id !== id && i.slug !== id);
    }

    res.status(200).json({
      success: true,
      message: 'Insight deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};
