import "reflect-metadata";
import cookieParser from "cookie-parser";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./modules/app.module.js";
import { applyHttpSecurity, validateSecurityConfig } from "./modules/security.js";

async function bootstrap() {
  validateSecurityConfig();
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: true, credentials: true });
  applyHttpSecurity(app);
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  await app.listen(Number(process.env.PORT ?? 3000));
}

void bootstrap();
