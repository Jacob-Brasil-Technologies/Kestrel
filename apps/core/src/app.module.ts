import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { GraphQLModule } from '@nestjs/graphql';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { AuthModule } from './modules/auth/auth.module';
import { ContentModule } from './modules/content/content.module';
import { CoreConfigModule } from './modules/core-config/core-config.module';
import { CoreConfigService } from './modules/core-config/core-config.service';
import { InstanceModule } from './modules/instance/instance.module';
import { ProcessModule } from './modules/process/process.module';
import { RuntimeModule } from './modules/runtime/runtime.module';
import { VariantModule } from './modules/variant/variant.module';

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true }),
		EventEmitterModule.forRoot(),
		TypeOrmModule.forRoot({
			type: 'better-sqlite3',
			database: join(process.cwd(), 'data', 'store', 'kestrel.db'),
			autoLoadEntities: true,
			synchronize: true,
			// WAL mode allows concurrent reads while writing — prevents console log
			// writes from blocking GraphQL queries during server startup.
			prepareDatabase: (db: any) => {
				db.pragma('journal_mode = WAL');
				db.pragma('busy_timeout = 3000');
			},
		}),
		ServeStaticModule.forRoot(
			{
				rootPath: join(process.cwd(), 'data', 'uploads'),
				serveRoot: '/uploads',
				serveStaticOptions: { index: false },
			},
			{
				rootPath: join(__dirname, 'assets'),
				serveRoot: '/assets',
				serveStaticOptions: { index: false },
			},
		),
		GraphQLModule.forRoot<ApolloDriverConfig>({
			driver: ApolloDriver,
			autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
			playground: false,
			subscriptions: {
				'graphql-ws': {
					onConnect: (ctx: any) => {
						// Pass connection params into the context so the auth guard can extract the JWT
						return { req: { headers: {}, connectionParams: ctx.connectionParams } };
					},
				},
				'subscriptions-transport-ws': true,
			},
			context: ({ req, connection }: any) => {
				// WS connections arrive with the context set in onConnect
				if (connection) {
					return connection.context;
				}
				return { req };
			},
			plugins: [
				ApolloServerPluginLandingPageLocalDefault({
					includeCookies: true,
				}),
			],
		}),
		RuntimeModule,
		InstanceModule,
		ProcessModule,
		ContentModule,
		CoreConfigModule,
		AuthModule,
		VariantModule,
	],
})
export class AppModule {
	constructor(private readonly coreConfigService: CoreConfigService) {
		void this.coreConfigService.createDefault();
	}
}
