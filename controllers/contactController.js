import Contact from '../models/Contact.js';

let localContacts = [];

export const submitContact = async (req, res) => {
  try {
    const { name, email, phone, company, service, budget, message } = req.body;
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || '';

    try {
      const contact = await Contact.create({
        name,
        email,
        phone,
        company,
        service,
        budget,
        message,
        ipAddress,
        status: 'new',
      });

      return res.status(201).json({
        success: true,
        message: 'Thank you! Your project inquiry has been received. Our engineering team will review and respond within 24 hours.',
        data: {
          id: contact._id,
          name: contact.name,
          email: contact.email,
          createdAt: contact.createdAt,
        },
      });
    } catch (dbErr) {
      const newContact = {
        _id: `contact-${Date.now()}`,
        name,
        email,
        phone,
        company,
        service,
        budget,
        message,
        ipAddress,
        status: 'new',
        createdAt: new Date(),
      };
      localContacts.unshift(newContact);

      return res.status(201).json({
        success: true,
        message: 'Thank you! Your project inquiry has been received. Our engineering team will review and respond within 24 hours.',
        data: {
          id: newContact._id,
          name: newContact.name,
          email: newContact.email,
          createdAt: newContact.createdAt,
        },
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

export const getContacts = async (req, res) => {
  try {
    const { status } = req.query;

    try {
      const query = {};
      if (status && status !== 'all') {
        query.status = status;
      }

      const contacts = await Contact.find(query).sort({ createdAt: -1 });
      if (contacts.length > 0) {
        return res.status(200).json({
          success: true,
          count: contacts.length,
          data: contacts,
        });
      }
    } catch (e) {}

    let filtered = [...localContacts];
    if (status && status !== 'all') {
      filtered = filtered.filter((c) => c.status === status);
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

export const updateContactStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    try {
      const contact = await Contact.findByIdAndUpdate(
        id,
        { status, ...(notes !== undefined && { notes }) },
        { new: true }
      );
      if (contact) {
        return res.status(200).json({
          success: true,
          data: contact,
        });
      }
    } catch (e) {}

    const index = localContacts.findIndex((c) => c._id === id);
    if (index !== -1) {
      localContacts[index].status = status || localContacts[index].status;
      if (notes !== undefined) localContacts[index].notes = notes;
      return res.status(200).json({
        success: true,
        data: localContacts[index],
      });
    }

    res.status(404).json({ success: false, message: 'Contact record not found' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

export const deleteContact = async (req, res) => {
  try {
    const { id } = req.params;

    try {
      await Contact.findByIdAndDelete(id);
    } catch (e) {
      localContacts = localContacts.filter((c) => c._id !== id);
    }

    res.status(200).json({
      success: true,
      message: 'Contact record removed successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};
