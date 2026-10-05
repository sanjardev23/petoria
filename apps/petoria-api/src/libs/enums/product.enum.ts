import { registerEnumType } from '@nestjs/graphql';

export enum ProductType {
	PET = 'PET',
	FOOD = 'FOOD',
	TOY = 'TOY',
	ACCESSORY = 'ACCESSORY',
}
registerEnumType(ProductType, {
	name: 'ProductType',
});

export enum ProductSpecies {
	DOG = 'DOG',
	CAT = 'CAT',
	BIRD = 'BIRD',
	FISH = 'FISH',
}
registerEnumType(ProductSpecies, {
	name: 'ProductSpecies',
});

export enum ProductGender {
	MALE = 'MALE',
	FEMALE = 'FEMALE',
}
registerEnumType(ProductGender, {
	name: 'ProductGender',
});

export enum ProductStatus {
	ACTIVE = 'ACTIVE',
	SOLD_OUT = 'SOLD_OUT',
	DELETE = 'DELETE',
}
registerEnumType(ProductStatus, {
	name: 'ProductStatus',
});

export enum ProductLocation {
	SEOUL = 'SEOUL',
	BUSAN = 'BUSAN',
	INCHEON = 'INCHEON',
	DAEGU = 'DAEGU',
	GYEONGJU = 'GYEONGJU',
	GWANGJU = 'GWANGJU',
	CHONJU = 'CHONJU',
	DAEJON = 'DAEJON',
	JEJU = 'JEJU',
}
registerEnumType(ProductLocation, {
	name: 'ProductLocation',
});
