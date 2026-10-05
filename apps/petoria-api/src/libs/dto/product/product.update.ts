import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, Length, Min } from 'class-validator';
import { ProductGender, ProductLocation, ProductSpecies, ProductStatus, ProductType } from '../../enums/product.enum';
import type { ObjectId } from 'mongoose';

@InputType()
export class ProductUpdate {
	@IsNotEmpty()
	@Field(() => String)
	_id!: ObjectId;

	@IsOptional()
	@Field(() => ProductType, { nullable: true })
	productType?: ProductType;

	@IsOptional()
	@Field(() => ProductStatus, { nullable: true })
	productStatus?: ProductStatus;

	@IsOptional()
	@Field(() => ProductSpecies, { nullable: true })
	productSpecies?: ProductSpecies;

	@IsOptional()
	@Field(() => ProductGender, { nullable: true })
	productGender?: ProductGender;

	@IsOptional()
	@Field(() => ProductLocation, { nullable: true })
	productLocation?: ProductLocation;

	@IsOptional()
	@Length(3, 100)
	@Field(() => String, { nullable: true })
	productTitle?: string;

	@IsOptional()
	@Min(0)
	@Field(() => Number, { nullable: true })
	productPrice?: number;

	@IsOptional()
	@Field(() => [String], { nullable: true })
	productImages?: string[];

	@IsOptional()
	@Length(5, 500)
	@Field(() => String, { nullable: true })
	productDesc?: string;

	@IsOptional()
	@Field(() => Date, { nullable: true })
	productBirthDate?: Date;

	soldOutAt?: Date;

	deletedAt?: Date;
}
