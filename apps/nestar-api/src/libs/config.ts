/* eslint-disable @typescript-eslint/no-unsafe-return */
import { ObjectId } from 'bson';

export const shapeIntoMongoObjectId = (target: any) => {
	return typeof target === 'string' ? new ObjectId(target) : target;
};
