export interface T {
	[key: string]: any;
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
