import { NestFactory } from '@nestjs/core';
import { graphqlUploadExpress } from 'graphql-upload-ts';
import { AppModule } from './app.module';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	const allowedOrigins = (process.env.CORS_ALLOWED_ORIGINS ?? '')
		.split(',')
		.map((origin) => origin.trim())
		.filter((origin) => origin.length > 0);

	app.enableCors({
		origin: (origin, callback) => {
			// Allow requests with no Origin header (non-browser clients, e.g. curl or native apps)
			if (!origin) {
				callback(null, true);
				return;
			}

			if (allowedOrigins.includes(origin)) {
				callback(null, true);
				return;
			}

			callback(new Error('Not allowed by CORS'), false);
		},
		credentials: true,
	});
	app.use(graphqlUploadExpress({ maxFileSize: 10_000_000, maxFiles: 1 }));
	await app.listen(process.env.KESTREL_PORT ?? 17773);
}
void bootstrap();
