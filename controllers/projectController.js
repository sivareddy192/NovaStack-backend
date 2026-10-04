import Project from '../models/Project.js';
import mongoose from 'mongoose';
import { isDbConnected } from '../config/db.js';

export const getProjects = async (req, res) => {
  try {
    const { category, featured, search, includeUnpublished } = req.query;

    if (isDbConnected()) {
      try {
        const query = includeUnpublished === 'true' ? {} : { published: true };

        if (category && category !== 'All') {
          query.category = category;
        }

        if (featured === 'true') {
          query.featured = true;
        }

        if (search) {
          query.$or = [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
            { technologies: { $in: [new RegExp(search, 'i')] } },
          ];
        }

        const projects = await Project.find(query).sort({ order: 1, createdAt: -1 });

        return res.status(200).json({
          success: true,
          count: projects.length,
          data: projects,
        });
      } catch (dbErr) {
        return res.status(500).json({
          success: false,
          message: 'Unable to load projects from the database.',
        });
      }
    }

    return res.status(503).json({
      success: false,
      message: 'Project database is unavailable.',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

export const getProjectBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    if (isDbConnected()) {
      try {
        const lookup = mongoose.isValidObjectId(slug)
          ? { $or: [{ _id: slug }, { slug: slug }], published: true }
          : { slug, published: true };
        const project = await Project.findOne(lookup);
        if (project) {
          return res.status(200).json({
            success: true,
            data: project,
          });
        }

      } catch (e) {}
    }

    return res.status(503).json({
      success: false,
      message: 'Project database is unavailable.',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

export const createProject = async (req, res) => {
  try {
    if (isDbConnected()) {
      try {
        const project = await Project.create(req.body);
        return res.status(201).json({
          success: true,
          data: project,
        });
      } catch (dbErr) {
        return res.status(400).json({
          success: false,
          message: dbErr.message || 'Unable to save project to the database.',
        });
      }
    }

    return res.status(503).json({
      success: false,
      message: 'Project database is unavailable.',
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

export const updateProject = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isDbConnected()) {
      return res.status(503).json({
        success: false,
        message: 'Project database is unavailable.',
      });
    }

    const lookup = mongoose.isValidObjectId(id)
      ? { $or: [{ _id: id }, { slug: id }] }
      : { slug: id };
    const project = await Project.findOneAndUpdate(lookup, req.body, {
      new: true,
      runValidators: true,
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found in the database.',
      });
    }

    return res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message || 'Unable to update project' });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isDbConnected()) {
      return res.status(503).json({
        success: false,
        message: 'Project database is unavailable.',
      });
    }

    const lookup = mongoose.isValidObjectId(id)
      ? { $or: [{ _id: id }, { slug: id }] }
      : { slug: id };
    const project = await Project.findOneAndDelete(lookup);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found in the database.' });
    }

    res.status(200).json({
      success: true,
      message: 'Project deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};
