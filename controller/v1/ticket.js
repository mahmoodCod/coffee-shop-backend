const { createTicketValidator, updateTicketValidator } = require('../../validator/ticket');
const { errorResponse, successRespons } = require('../../helpers/responses');
const Ticket = require('../../model/Ticket');
const Department = require('../../model/Department');
const DepartmentSub = require('../../model/Department-sub');
const Product = require('../../model/Product');
const { isValidObjectId } = require('mongoose');

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