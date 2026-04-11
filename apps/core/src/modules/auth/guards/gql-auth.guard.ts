import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { JwtService } from '@nestjs/jwt';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { AuthService } from '../auth.service';

@Injectable()
export class GqlAuthGuard implements CanActivate {
	constructor(
		private readonly reflector: Reflector,
		private readonly jwtService: JwtService,
		private readonly authService: AuthService,
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [context.getHandler(), context.getClass()]);
		if (isPublic) return true;

		const ctx = GqlExecutionContext.create(context);
		const gqlContext = ctx.getContext();
		const req = gqlContext.req;

		const token = this.extractToken(req);
		if (!token) throw new UnauthorizedException();

		try {
			const payload = this.jwtService.verify(token);
			req.user = await this.authService.validateUser(payload.sub);
			return true;
		} catch {
			throw new UnauthorizedException();
		}
	}

	private extractToken(req: any): string | undefined {
		// HTTP: Authorization header
		const auth = req?.headers?.authorization;
		if (auth?.startsWith('Bearer ')) return auth.slice(7);

		// WebSocket: connection params
		const wsToken = req?.connectionParams?.authorization ?? req?.connectionParams?.Authorization;
		if (wsToken?.startsWith('Bearer ')) return wsToken.slice(7);
		return wsToken;
	}
}
