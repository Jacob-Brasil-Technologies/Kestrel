import { NestFactory } from '@nestjs/core';
import { graphqlUploadExpress } from 'graphql-upload-ts';
import { AppModule } from './app.module';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	app.enableCors();
	app.use(graphqlUploadExpress({ maxFileSize: 10_000_000, maxFiles: 1 }));
	await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
