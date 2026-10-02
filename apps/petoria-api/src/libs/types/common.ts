import { ObjectId } from 'mongoose';

export interface T {
	[key: string]: any;
}

export interface StatisticModifier {
	_id: ObjectId;
	targetKey: string;
	modifier: number;
}

export interface GraphqlErrorShape {
	message?: string;
	extensions?: {
		code?: string;
		exception?: {
			response?: {
				message?: string;
			};
		};
		response?: {
			message?: string;
		};
	};
}
