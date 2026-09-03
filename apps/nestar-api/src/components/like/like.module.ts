import { Module } from '@nestjs/common';
import LikeSchema from '../../schemas/Like.model';
import { MongooseModule } from '@nestjs/mongoose';
import { LikeService } from './like.service';

@Module({
	imports: [
		MongooseModule.forFeature([
			{
				name: 'Like',
				schema: LikeSchema,
			},
		]),
	],
	providers: [LikeService],
	exports: [LikeService],
})
export class LikeModule {}
