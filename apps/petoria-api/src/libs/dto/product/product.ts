import { Field, Int, ObjectType } from '@nestjs/graphql';
import type { ObjectId } from 'mongoose';
import { ProductGender, ProductLocation, ProductSpecies, ProductStatus, ProductType } from '../../enums/product.enum';
import { Member, TotalCounter } from '../member/member';
import { MeLiked } from '../like/like';

@ObjectType()
export class Product {
	@Field(() => String)
	_id!: ObjectId;

	@Field(() => ProductType)
	productType!: ProductType;

	@Field(() => ProductStatus)
	productStatus!: ProductStatus;

	@Field(() => ProductSpecies)
	productSpecies!: ProductSpecies;

	@Field(() => ProductGender, { nullable: true })
	productGender?: ProductGender;

	@Field(() => ProductLocation)
	productLocation!: ProductLocation;

	@Field(() => String)
	productTitle!: string;

	@Field(() => Number)
	productPrice!: number;

	@Field(() => Int)
	productViews!: number;

	@Field(() => Int)
	productLikes!: number;

	@Field(() => Int)
	productComments!: number;

	@Field(() => Int)
	productRank!: number;

	@Field(() => [String])
	productImages!: string[];

	@Field(() => String, { nullable: true })
	productDesc?: string;

	@Field(() => String)
	memberId!: ObjectId;

	@Field(() => Date, { nullable: true })
	productBirthDate?: Date;

	@Field(() => Date, { nullable: true })
	soldOutAt?: Date;

	@Field(() => Date, { nullable: true })
	deletedAt?: Date;

	@Field(() => Date)
	createdAt!: Date;

	@Field(() => Date)
	updatedAt!: Date;

	/** from aggregation **/

	@Field(() => Member, { nullable: true })
	memberData?: Member;

	@Field(() => [MeLiked], { nullable: true })
	meLiked?: MeLiked[];
}

@ObjectType()
export class Products {
	@Field(() => [Product])
	list!: Product[];

	@Field(() => [TotalCounter], { nullable: true })
	metaCounter!: TotalCounter[];
}
