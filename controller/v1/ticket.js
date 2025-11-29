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

        const validationData = { ...req.body, user: user.toString() };
        await createTicketValidator.validate(validationData, { abortEarly: false });

        if (!isValidObjectId(departmentId)) return errorResponse(res, 400, 'شناسه دپارتمان نامعتبر است');
        const departmentExists = await Department.findById(departmentId);
        if (!departmentExists) return errorResponse(res, 404, 'دپارتمان یافت نشد');

        if (!isValidObjectId(departmentSubId)) return errorResponse(res, 400, 'شناسه دپارتمان فرعی نامعتبر است');
        const departmentSubExists = await DepartmentSub.findById(departmentSubId);
        if (!departmentSubExists) return errorResponse(res, 404, 'دپارتمان فرعی یافت نشد');

        if (product) {
            if (!isValidObjectId(product)) return errorResponse(res, 400, 'شناسه محصول نامعتبر است');
            const productExists = await Product.findById(product);
            if (!productExists) return errorResponse(res, 404, 'محصول یافت نشد');
        }

        if (parent) {
            if (!isValidObjectId(parent)) return errorResponse(res, 400, 'شناسه تیکت والد نامعتبر است');
            const parentTicketExists = await Ticket.findById(parent);
            if (!parentTicketExists) return errorResponse(res, 404, 'تیکت والد یافت نشد');
        }

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

        await newTicket.populate('departmentId', 'title')
            .populate('departmentSubId', 'title')
            .populate('user', 'name email phone');
        if (newTicket.product) await newTicket.populate('product', 'name slug');
        if (newTicket.parent) await newTicket.populate('parent', 'title status');

        return successRespons(res, 201, {
            ticket: newTicket,
            message: 'تیکت با موفقیت ایجاد شد'
        });

    } catch (err) {
        next(err);
    }
};

exports.getAllTicket = async (req,res,next) => {
    try {
        const { page=1, limit=10, status, priority, departmentId, departmentSubId, user, product, isAnswered } = req.query;
        const filters = {};

        if (status && ['open','answered','closed'].includes(status)) filters.status = status;
        if (priority && ['low','medium','high'].includes(priority)) filters.priority = priority;
        if (departmentId && isValidObjectId(departmentId)) filters.departmentId = departmentId;
        if (departmentSubId && isValidObjectId(departmentSubId)) filters.departmentSubId = departmentSubId;
        if (user && isValidObjectId(user)) filters.user = user;
        if (product && isValidObjectId(product)) filters.product = product;
        if (isAnswered !== undefined) filters.isAnswered = isAnswered === 'true' || isAnswered === true;

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);

        const tickets = await Ticket.find(filters)
            .populate('departmentId','title')
            .populate('departmentSubId','title')
            .populate('user','name email phone')
            .populate('product','name slug')
            .populate('parent','title status')
            .sort({ createdAt: -1 })
            .skip((pageNum-1)*limitNum)
            .limit(limitNum)
            .select('-__v');

        const totalTickets = await Ticket.countDocuments(filters);

        return successRespons(res, 200, {
            tickets,
            pagination: createPaginationData(pageNum, limitNum, totalTickets, 'تیکت‌ها')
        });

    } catch (err) {
        next(err);
    }
};

exports.getOneTicket = async (req,res,next) => {
    try {
        const { id } = req.params;
        const user = req.user;

        if (!isValidObjectId(id)) return errorResponse(res, 400, 'شناسه تیکت نامعتبر است');

        const ticket = await Ticket.findById(id)
            .populate('departmentId','title')
            .populate('departmentSubId','title')
            .populate('user','name email phone')
            .populate('product','name slug')
            .populate('parent','title status')
            .select('-__v');

        if (!ticket) return errorResponse(res, 404, 'تیکت یافت نشد');

        const isAdmin = user.roles?.includes('ADMIN');
        const isOwner = ticket.user._id.toString() === user._id.toString();
        if (!isAdmin && !isOwner) return errorResponse(res, 403, 'دسترسی به این تیکت ندارید');

        return successRespons(res, 200, { ticket });

    } catch (err) {
        next(err);
    }
};

exports.updateTicket = async (req,res,next) => {
    try {
        const { id } = req.params;
        const user = req.user;
        const data = req.body;

        if (!isValidObjectId(id)) return errorResponse(res, 400, 'شناسه تیکت نامعتبر است');

        const ticket = await Ticket.findById(id);
        if (!ticket) return errorResponse(res, 404, 'تیکت یافت نشد');

        const isAdmin = user.roles?.includes('ADMIN');
        const isOwner = ticket.user.toString() === user._id.toString();
        if (!isAdmin && !isOwner) return errorResponse(res, 403, 'دسترسی به این تیکت ندارید');

        await updateTicketValidator.validate(data, { abortEarly: false });

        const updateData = {};
        if (data.departmentId) {
            if (!isValidObjectId(data.departmentId)) return errorResponse(res, 400, 'شناسه دپارتمان نامعتبر است');
            const dep = await Department.findById(data.departmentId);
            if (!dep) return errorResponse(res, 404, 'دپارتمان یافت نشد');
            updateData.departmentId = data.departmentId;
        }
        if (data.departmentSubId) {
            if (!isValidObjectId(data.departmentSubId)) return errorResponse(res, 400, 'شناسه دپارتمان فرعی نامعتبر است');
            const sub = await DepartmentSub.findById(data.departmentSubId);
            if (!sub) return errorResponse(res, 404, 'دپارتمان فرعی یافت نشد');
            updateData.departmentSubId = data.departmentSubId;
        }
        if (data.priority && ['low','medium','high'].includes(data.priority)) updateData.priority = data.priority;
        if (data.title) updateData.title = data.title.trim();
        if (data.body) updateData.body = data.body.trim();
        if (data.product) {
            if (!isValidObjectId(data.product)) return errorResponse(res, 400, 'شناسه محصول نامعتبر است');
            const prod = await Product.findById(data.product);
            if (!prod) return errorResponse(res, 404, 'محصول یافت نشد');
            updateData.product = data.product;
        }
        if (data.parent) {
            if (!isValidObjectId(data.parent)) return errorResponse(res, 400, 'شناسه تیکت والد نامعتبر است');
            const parentTicket = await Ticket.findById(data.parent);
            if (!parentTicket) return errorResponse(res, 404, 'تیکت والد یافت نشد');
            updateData.parent = data.parent;
        }
        if (data.isAnswered !== undefined) updateData.isAnswered = data.isAnswered;
        if (data.status && ['open','answered','closed'].includes(data.status)) updateData.status = data.status;

        if (!Object.keys(updateData).length) return errorResponse(res, 400, 'فیلدی برای بروزرسانی وجود ندارد');

        const updatedTicket = await Ticket.findByIdAndUpdate(id, updateData, { new:true, runValidators:true })
            .populate('departmentId','title')
            .populate('departmentSubId','title')
            .populate('user','name email phone')
            .populate('product','name slug')
            .populate('parent','title status')
            .select('-__v');

        return successRespons(res, 200, {
            ticket: updatedTicket,
            message: 'تیکت با موفقیت بروزرسانی شد'
        });

    } catch (err) {
        next(err);
    }
};

exports.deleteTicket = async (req,res,next) => {
    try {
        const { id } = req.params;
        const user = req.user;

        if (!isValidObjectId(id)) return errorResponse(res, 400, 'شناسه تیکت نامعتبر است');

        const ticket = await Ticket.findById(id);
        if (!ticket) return errorResponse(res, 404, 'تیکت یافت نشد');

        const isAdmin = user.roles?.includes('ADMIN');
        const isOwner = ticket.user.toString() === user._id.toString();
        if (!isAdmin && !isOwner) return errorResponse(res, 403, 'دسترسی به این تیکت ندارید');

        const deletedTicket = await Ticket.findByIdAndDelete(id);

        return successRespons(res, 200, {
            ticket: deletedTicket,
            message: 'تیکت با موفقیت حذف شد'
        });

    } catch (err) {
        next(err);
    }
};

exports.getMyTickets = async (req,res,next) => {
    try {
        const user = req.user._id;
        const { page=1, limit=10, status, priority, departmentId, departmentSubId, product, isAnswered } = req.query;
        const filters = { user };

        if (status && ['open','answered','closed'].includes(status)) filters.status = status;
        if (priority && ['low','medium','high'].includes(priority)) filters.priority = priority;
        if (departmentId && isValidObjectId(departmentId)) filters.departmentId = departmentId;
        if (departmentSubId && isValidObjectId(departmentSubId)) filters.departmentSubId = departmentSubId;
        if (product && isValidObjectId(product)) filters.product = product;
        if (isAnswered !== undefined) filters.isAnswered = isAnswered === 'true' || isAnswered === true;

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);

        const tickets = await Ticket.find(filters)
            .populate('departmentId','title')
            .populate('departmentSubId','title')
            .populate('user','name email phone')
            .populate('product','name slug')
            .populate('parent','title status')
            .sort({ createdAt:-1 })
            .skip((pageNum-1)*limitNum)
            .limit(limitNum)
            .select('-__v');

        const totalTickets = await Ticket.countDocuments(filters);

        return successRespons(res, 200, {
            tickets,
            pagination: createPaginationData(pageNum, limitNum, totalTickets, 'تیکت‌ها')
        });

    } catch (err) {
        next(err);
    }
};

exports.replyTicket = async (req,res,next) => {
    try {
        const { id } = req.params;
        const adminUser = req.user._id;
        const { title, body } = req.body;

        if (!isValidObjectId(id)) return errorResponse(res, 400, 'شناسه تیکت نامعتبر است');

        const parentTicket = await Ticket.findById(id);
        if (!parentTicket) return errorResponse(res, 404, 'تیکت یافت نشد');
        if (parentTicket.status === 'closed') return errorResponse(res, 400, 'امکان پاسخ‌دهی به تیکت بسته شده وجود ندارد');

        if (!title || title.trim().length<3) return errorResponse(res, 400, 'عنوان تیکت باید حداقل ۳ کاراکتر باشد');
        if (!body || body.trim().length<5) return errorResponse(res, 400, 'متن تیکت باید حداقل ۵ کاراکتر باشد');

        const replyTicket = await Ticket.create({
            departmentId: parentTicket.departmentId,
            departmentSubId: parentTicket.departmentSubId,
            priority: parentTicket.priority,
            title: title.trim(),
            body: body.trim(),
            user: adminUser,
            product: parentTicket.product || undefined,
            parent: parentTicket._id,
            isAnswered: false,
            status: 'open'
        });

        await Ticket.findByIdAndUpdate(id, { status:'answered', isAnswered:true }, { new:true });

        await replyTicket.populate('departmentId','title')
            .populate('departmentSubId','title')
            .populate('user','name email phone');
        if (replyTicket.product) await replyTicket.populate('product','name slug');
        await replyTicket.populate('parent','title status');

        return successRespons(res, 201, {
            ticket: replyTicket,
            message: 'پاسخ تیکت با موفقیت ثبت شد'
        });

    } catch (err) {
        next(err);
    }
};

exports.closeTicket = async (req,res,next) => {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) return errorResponse(res, 400, 'شناسه تیکت نامعتبر است');

        const ticket = await Ticket.findById(id);
        if (!ticket) return errorResponse(res, 404, 'تیکت یافت نشد');
        if (ticket.status==='closed') return errorResponse(res, 400, 'تیکت قبلاً بسته شده است');

        const closedTicket = await Ticket.findByIdAndUpdate(id, { status:'closed' }, { new:true, runValidators:true })
            .populate('departmentId','title')
            .populate('departmentSubId','title')
            .populate('user','name email phone')
            .populate('product','name slug')
            .populate('parent','title status')
            .select('-__v');

        return successRespons(res, 200, {
            ticket: closedTicket,
            message: 'تیکت با موفقیت بسته شد'
        });

    } catch (err) {
        next(err);
    }
};
