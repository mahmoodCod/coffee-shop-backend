const { createTicketValidator, updateTicketValidator } = require('../../validator/ticket');
const { errorResponse, successRespons } = require('../../helpers/responses');
const Ticket = require('../../model/Ticket');
const Department = require('../../model/Department');
const DepartmentSub = require('../../model/Department-sub');
const Product = require('../../model/Product');
const { isValidObjectId } = require('mongoose');
const { createPaginationData } = require('../../utils');

exports.createTicket = async (req,res,next) => {
    try {
        const user = req.user._id;
        const { departmentId, departmentSubId, priority, title, body, product, parent } = req.body;

        // Prepare validation data (user from req.user, not from body)
        const validationData = {
            ...req.body,
            user: user.toString()
        };

        // Validate request body
        await createTicketValidator.validate(validationData, { abortEarly: false });

        // Check if Department exists
        if (!isValidObjectId(departmentId)) {
            return errorResponse(res, 400, 'Invalid departmentId');
        }
        const departmentExists = await Department.findById(departmentId);
        if (!departmentExists) {
            return errorResponse(res, 404, 'Department not found');
        }

        // Check if DepartmentSub exists
        if (!isValidObjectId(departmentSubId)) {
            return errorResponse(res, 400, 'Invalid departmentSubId');
        }
        const departmentSubExists = await DepartmentSub.findById(departmentSubId);
        if (!departmentSubExists) {
            return errorResponse(res, 404, 'DepartmentSub not found');
        }

        // Check if product exists (if provided)
        if (product) {
            if (!isValidObjectId(product)) {
                return errorResponse(res, 400, 'Invalid product ID');
            }
            const productExists = await Product.findById(product);
            if (!productExists) {
                return errorResponse(res, 404, 'Product not found');
            }
        }

        // Check if parent ticket exists (if provided)
        if (parent) {
            if (!isValidObjectId(parent)) {
                return errorResponse(res, 400, 'Invalid parent ticket ID');
            }
            const parentTicketExists = await Ticket.findById(parent);
            if (!parentTicketExists) {
                return errorResponse(res, 404, 'Parent ticket not found');
            }
        }

        // Create Ticket
        const newTicket = await Ticket.create({
            departmentId,
            departmentSubId,
            priority: priority || 'medium',
            title: title.trim(),
            body: body.trim(),
            user,
            product: product || undefined,
            parent: parent || undefined,
            isAnswered: false,
            status: 'open'
        });

        // Populate related fields
        await newTicket.populate('departmentId', 'title');
        await newTicket.populate('departmentSubId', 'title');
        await newTicket.populate('user', 'name email phone');
        if (newTicket.product) {
            await newTicket.populate('product', 'name slug');
        }
        if (newTicket.parent) {
            await newTicket.populate('parent', 'title status');
        }

        return successRespons(res, 201, {
            ticket: newTicket,
            message: 'Ticket created successfully'
        });

    } catch (err) {
        next(err);
    };
};

exports.getAllTicket = async (req,res,next) => {
    try {
        const { 
            page = 1, 
            limit = 10, 
            status,
            priority,
            departmentId,
            departmentSubId,
            user,
            product,
            isAnswered
        } = req.query;

        // Build filters
        const filters = {};

        // Filter by status
        if (status !== undefined) {
            if (['open', 'answered', 'closed'].includes(status)) {
                filters.status = status;
            }
        }

        // Filter by priority
        if (priority !== undefined) {
            if (['low', 'medium', 'high'].includes(priority)) {
                filters.priority = priority;
            }
        }

        // Filter by departmentId
        if (departmentId !== undefined) {
            if (isValidObjectId(departmentId)) {
                filters.departmentId = departmentId;
            }
        }

        // Filter by departmentSubId
        if (departmentSubId !== undefined) {
            if (isValidObjectId(departmentSubId)) {
                filters.departmentSubId = departmentSubId;
            }
        }

        // Filter by user
        if (user !== undefined) {
            if (isValidObjectId(user)) {
                filters.user = user;
            }
        }

        // Filter by product
        if (product !== undefined) {
            if (isValidObjectId(product)) {
                filters.product = product;
            }
        }

        // Filter by isAnswered
        if (isAnswered !== undefined) {
            filters.isAnswered = isAnswered === 'true' || isAnswered === true;
        }

        // Parse pagination parameters
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);

        // Find tickets with filters, pagination, and populate related fields
        const tickets = await Ticket.find(filters)
            .populate('departmentId', 'title')
            .populate('departmentSubId', 'title')
            .populate('user', 'name email phone')
            .populate('product', 'name slug')
            .populate('parent', 'title status')
            .sort({ createdAt: 'desc' })
            .skip((pageNum - 1) * limitNum)
            .limit(limitNum)
            .select('-__v');

        // Count total tickets with filters
        const totalTickets = await Ticket.countDocuments(filters);

        return successRespons(res, 200, {
            tickets,
            pagination: createPaginationData(pageNum, limitNum, totalTickets, 'Tickets'),
        });

    } catch (err) {
        next(err);
    };
};

exports.getOneTicket = async (req,res,next) => {
    try {

    } catch (err) {
        next(err);
    };
};

exports.updateTicket = async (req,res,next) => {
    try {

    } catch (err) {
        next(err);
    };
};

exports.deleteTicket = async (req,res,next) => {
    try {

    } catch (err) {
        next(err);
    };
};

exports.getMyTickets = async (req,res,next) => {
    try {

    } catch (err) {
        next(err);
    };
};

exports.replyTicket = async (req,res,next) => {
    try {

    } catch (err) {
        next(err);
    };
};

exports.closeTicket = async (req,res,next) => {
    try {

    } catch (err) {
        next(err);
    };
};