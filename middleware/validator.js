import validator from 'validator';

export const validateContactInput = (req, res, next) => {
  const { name, email, message } = req.body;

  if (!name || validator.isEmpty(String(name).trim())) {
    return res.status(400).json({
      success: false,
      message: 'Please provide your full name.',
    });
  }

  if (!email || !validator.isEmail(String(email).trim())) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid email address.',
    });
  }

  if (!message || validator.isEmpty(String(message).trim())) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a message or project overview.',
    });
  }

  // Basic sanitization
  req.body.name = validator.escape(String(name).trim());
  req.body.email = validator.normalizeEmail(String(email).trim());
  if (req.body.phone) req.body.phone = validator.escape(String(req.body.phone).trim());
  if (req.body.company) req.body.company = validator.escape(String(req.body.company).trim());
  if (req.body.service) req.body.service = validator.escape(String(req.body.service).trim());
  if (req.body.budget) req.body.budget = validator.escape(String(req.body.budget).trim());

  next();
};

export const validateEstimatorLeadInput = (req, res, next) => {
  const { projectType, complexity, designLevel, timeline, contact } = req.body;

  if (!projectType || !complexity || !designLevel || !timeline) {
    return res.status(400).json({
      success: false,
      message: 'Project estimation parameters are missing or incomplete.',
    });
  }

  if (!contact || !contact.name || !contact.email) {
    return res.status(400).json({
      success: false,
      message: 'Please provide your name and email to receive the estimate.',
    });
  }

  if (!validator.isEmail(String(contact.email).trim())) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid email address.',
    });
  }

  next();
};
