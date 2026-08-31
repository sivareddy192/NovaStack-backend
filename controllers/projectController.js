import Project from '../models/Project.js';
import { seedProjects } from '../config/seedData.js';
import { isDbConnected } from '../config/db.js';

let localProjects = [...seedProjects];

export const getProjects = async (req, res) => {
  try {
    const { category, featured, search } = req.query;

    if (isDbConnected()) {
      try {
        const query = { published: true };

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

        if (projects && projects.length > 0) {
          return res.status(200).json({
            success: true,
            count: projects.length,
            data: projects,
          });
        }
      } catch (dbErr) {}
    }

    let filtered = localProjects.filter((p) => p.published !== false);
    if (category && category !== 'All') {
      filtered = filtered.filter((p) => p.category === category);
    }
    if (featured === 'true') {
      filtered = filtered.filter((p) => p.featured === true);
    }
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(s) ||
          p.description.toLowerCase().includes(s) ||
          p.technologies.some((t) => t.toLowerCase().includes(s))
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

export const getProjectBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    if (isDbConnected()) {
      try {
        const project = await Project.findOne({ slug, published: true });
        if (project) {
          return res.status(200).json({
            success: true,
            data: project,
          });
        }
      } catch (e) {}
    }

    const fallbackProject = localProjects.find(
      (p) => p.slug === slug || p.slug.toLowerCase() === slug.toLowerCase()
    );

    if (!fallbackProject) {
      return res.status(404).json({
        success: false,
        message: `Project with slug '${slug}' not found`,
      });
    }

    res.status(200).json({
      success: true,
      data: fallbackProject,
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
      } catch (dbErr) {}
    }

    const newProj = { ...req.body, _id: `proj-${Date.now()}`, createdAt: new Date() };
    localProjects.unshift(newProj);
    return res.status(201).json({
      success: true,
      data: newProj,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

export const updateProject = async (req, res) => {
  try {
    const { id } = req.params;

    if (isDbConnected()) {
      try {
        const project = await Project.findByIdAndUpdate(id, req.body, {
          new: true,
          runValidators: true,
        });

        if (project) {
          return res.status(200).json({
            success: true,
            data: project,
          });
        }
      } catch (e) {}
    }

    const index = localProjects.findIndex((p) => p._id === id || p.slug === id);
    if (index !== -1) {
      localProjects[index] = { ...localProjects[index], ...req.body };
      return res.status(200).json({
        success: true,
        data: localProjects[index],
      });
    }

    res.status(404).json({
      success: false,
      message: 'Project not found',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;

    if (isDbConnected()) {
      try {
        await Project.findByIdAndDelete(id);
      } catch (e) {}
    }

    localProjects = localProjects.filter((p) => p._id !== id && p.slug !== id);

    res.status(200).json({
      success: true,
      message: 'Project deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};
