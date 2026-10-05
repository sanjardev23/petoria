import { Schema } from 'mongoose';
import { ProductGender, ProductLocation, ProductSpecies, ProductStatus, ProductType } from '../libs/enums/product.enum';

const ProductSchema = new Schema(
	{
		productType: {
			type: String,
			enum: ProductType,
			required: true,
		},

		productStatus: {
			type: String,
			enum: ProductStatus,
			default: ProductStatus.ACTIVE,
		},

		productSpecies: {
			type: String,
			enum: ProductSpecies,
			required: true,
		},

		// only for PET products
		productGender: {
			type: String,
			enum: ProductGender,
		},

		productLocation: {
			type: String,
			enum: ProductLocation,
			required: true,
		},

		productTitle: {
			type: String,
			required: true,
		},

		productPrice: {
			type: Number,
			required: true,
		},

		productViews: {
			type: Number,
			default: 0,
		},

		productLikes: {
			type: Number,
			default: 0,
		},

		productComments: {
			type: Number,
			default: 0,
		},

		productRank: {
			type: Number,
			default: 0,
		},

		productImages: {
			type: [String],
			required: true,
		},

		productDesc: {
			type: String,
		},

		memberId: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: 'Member',
		},

		// only for PET products
		productBirthDate: {
			type: Date,
		},

		soldOutAt: {
			type: Date,
		},

		deletedAt: {
			type: Date,
		},
	},
	{ timestamps: true, collection: 'products' },
);

ProductSchema.index({ memberId: 1, productTitle: 1 }, { unique: true });

export default ProductSchema;
