import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver } from '@nestjs/apollo';
import { AppResolver } from './app.resolver';
import { ComponentsModule } from './components/components.module';
import { DatabaseModule } from './database/database.module';
import { GraphqlErrorShape } from './libs/types/common';

@Module({
	imports: [
		ConfigModule.forRoot(),
		GraphQLModule.forRoot({
			driver: ApolloDriver,
			playground: true,
			upload: false,
			autoSchemaFile: true,
			formatError: (error: GraphqlErrorShape) => {
				const graphqlFormattedError = {
					message:
						error?.extensions?.exception?.response?.message || error?.extensions?.response?.message || error?.message,
					extensions: {
						code: error?.extensions?.code,
					},
				};
				console.log('GRAPHQL GLOBAL ERR:', graphqlFormattedError);
				return graphqlFormattedError;
			},
		}),
		ComponentsModule,
		DatabaseModule,
	],
	controllers: [AppController],
	providers: [AppService, AppResolver],
})
export class AppModule {}
