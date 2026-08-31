import Project from '../models/Project.js';
import Insight from '../models/Insight.js';
import Contact from '../models/Contact.js';
import EstimatorLead from '../models/EstimatorLead.js';
import PricingConfig from '../models/PricingConfig.js';
import User from '../models/User.js';
import { defaultPricingConfig, seedProjects, seedInsights } from '../config/seedData.js';
import { isDbConnected } from '../config/db.js';

let inMemoryUsers = [];

export const getDashboardStats = async (req, res) => {
  try {
    let totalProjects = seedProjects.length;
    let totalInsights = seedInsights.length;
    let totalContacts = 0;
    let newContacts = 0;
    let totalEstimatorLeads = 0;
    let newEstimatorLeads = 0;
    let totalUsers = inMemoryUsers.length;
    let recentContacts = [];
    let recentEstimatorLeads = [];

    if (isDbConnected()) {
      try {
        totalProjects = await Project.countDocuments();
        totalInsights = await Insight.countDocuments();
        totalContacts = await Contact.countDocuments();
        newContacts = await Contact.countDocuments({ status: 'new' });
        totalEstimatorLeads = await EstimatorLead.countDocuments();
        newEstimatorLeads = await EstimatorLead.countDocuments({ status: 'new' });
        totalUsers = await User.countDocuments();

        recentContacts = await Contact.find().sort({ createdAt: -1 }).limit(5);
        recentEstimatorLeads = await EstimatorLead.find().sort({ createdAt: -1 }).limit(5);
      } catch (e) {}
    }

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalProjects,
          totalInsights,
          totalContacts,
          newContacts,
          totalEstimatorLeads,
          newEstimatorLeads,
          totalLeads: totalContacts + totalEstimatorLeads,
          newLeads: newContacts + newEstimatorLeads,
          totalUsers,
        },
        recentContacts,
        recentEstimatorLeads,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

export const updatePricingConfig = async (req, res) => {
  try {
    if (isDbConnected()) {
      try {
        let config = await PricingConfig.findOne({ isDefault: true });
        if (config) {
          config = await PricingConfig.findByIdAndUpdate(config._id, req.body, {
            new: true,
            runValidators: true,
          });
        } else {
          config = await PricingConfig.create({ ...req.body, isDefault: true });
        }

        return res.status(200).json({
          success: true,
          data: config,
        });
      } catch (e) {}
    }

    return res.status(200).json({
      success: true,
      data: { ...defaultPricingConfig, ...req.body },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    if (isDbConnected()) {
      try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        return res.status(200).json({
          success: true,
          count: users.length,
          data: users,
        });
      } catch (dbErr) {}
    }

    return res.status(200).json({
      success: true,
      count: inMemoryUsers.length,
      data: inMemoryUsers,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role || !['user', 'admin', 'superadmin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role specified. Must be user, admin, or superadmin.',
      });
    }

    if (isDbConnected()) {
      try {
        const user = await User.findByIdAndUpdate(
          id,
          { role },
          { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
          return res.status(404).json({
            success: false,
            message: 'User not found in MongoDB',
          });
        }

        return res.status(200).json({
          success: true,
          message: `User role successfully updated to ${role}`,
          data: user,
        });
      } catch (dbErr) {}
    }

    const userIndex = inMemoryUsers.findIndex((u) => u._id === id || u.id === id);
    if (userIndex !== -1) {
      inMemoryUsers[userIndex].role = role;
      return res.status(200).json({
        success: true,
        message: `User role successfully updated to ${role}`,
        data: inMemoryUsers[userIndex],
      });
    }

    return res.status(404).json({
      success: false,
      message: 'User not found',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (isDbConnected()) {
      try {
        const user = await User.findByIdAndDelete(id);
        if (!user) {
          return res.status(404).json({
            success: false,
            message: 'User not found',
          });
        }
        return res.status(200).json({
          success: true,
          message: 'User successfully deleted',
        });
      } catch (dbErr) {}
    }

    inMemoryUsers = inMemoryUsers.filter((u) => u._id !== id && u.id !== id);
    return res.status(200).json({
      success: true,
      message: 'User successfully deleted',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};
