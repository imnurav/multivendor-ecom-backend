import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AdminResetPasswordDto } from './dto/admin-reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  signup(@Body() body: SignupDto) {
    return this.authService.signup(body);
  }

  @Post('login')
  login(@Body() body: LoginDto) {
    return this.authService.login(body);
  }

  @Post('forgot-password')
  forgotPassword(@Body() body: ForgotPasswordDto) {
    return this.authService.forgotPassword(body);
  }

  @Post('reset-password')
  resetPassword(@Body() body: ResetPasswordDto) {
    return this.authService.resetPassword(body);
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  changePassword(
    @Req() req: Request & { user: { sub: string } },
    @Body() body: ChangePasswordDto,
  ) {
    return this.authService.changePassword(req.user.sub, body);
  }

  @Post('admin/reset-password')
  @UseGuards(JwtAuthGuard)
  adminResetPassword(
    @Req() req: Request & { user: { sub: string; role?: string } },
    @Body() body: AdminResetPasswordDto,
  ) {
    return this.authService.adminResetPassword(req.user.role, body);
  }
}
