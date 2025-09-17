import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetOrganizationId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    // Extract organizationId from user object in JWT token
    return request.user.organizationId;
  },
);
