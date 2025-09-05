// get-organization-id.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetOrganizationId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user.organizationId;
  },
);
