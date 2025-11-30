const { successRespons } = require('../../helpers/responses');
const Product = require('../../model/Product');

exports.searchProducts = async (req,res,next) => {
    try {
        const { search } = req.query;

        const products = await Product.find({
            name: { $regex: '.*' + search + '.*', $options: 'i' }
        }).limit(20);

        return successRespons(res, 200, { products });
} catch (err) {
    next (err);
    };
};