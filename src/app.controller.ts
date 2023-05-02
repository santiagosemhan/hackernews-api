import { Controller, Get, Request, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { LocalAuthGuard } from './auth/local-auth.guard';
import { AuthService } from './auth/auth.service';
import { ApiBearerAuth, ApiBody, ApiResponse } from '@nestjs/swagger';

@ApiBearerAuth('JWT')
@Controller()
export class AppController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('auth/login')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        username: {
          type: 'string',
          example: 'test',
        },
        password: {
          type: 'string',
          example: 'test',
        },
      },
    },
  })
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  @Get()
  @ApiResponse({
    status: 200,
    description: 'Health check endpoint',
    schema: { example: { status: 'ok', time: 1619788800000 } },
  })
  healthCheck(): { status: string; time: number } {
    return { status: 'ok', time: new Date().getTime() };
  }
}
